import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getDeliveryCostForLocation,
  normalizeDeliveryLocations,
  defaultDeliveryLocations,
  detectDeliveryLocation,
} from "@/lib/deliveryLocations";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchActiveFlashSales, resolveCheckoutPrice } from "@/lib/flashSale";

/**
 * POST /api/checkout/init
 *
 * Creates a pending order (no payment initialization).  After the order is
 * created the client should redirect to /checkout/payment?orderId=… where
 * the user picks a payment gateway and triggers /api/checkout/pay.
 *
 * Flash sale prices are **enforced server-side**: each item's price is
 * recalculated against currently-active flash sales.  The client-sent price
 * is ignored; the server-authoritative price is used instead.
 *
 * Stock is also **enforced server-side**: every item's requested quantity is
 * re-checked against the live ProductVariant.stock at the moment of order
 * creation.  The check and the decrement happen atomically inside the same
 * transaction that creates the order, so two concurrent checkouts cannot both
 * pass the check on the final unit.  If any item is short, the order is
 * rejected (409) before payment is ever initialized.
 */

class StockShortageError extends Error {
  constructor(
    public shortItems: {
      variantId: string;
      name: string;
      sku: string;
      requested: number;
      available: number;
    }[],
  ) {
    super("STOCK_SHORTAGE");
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    email,
    firstName,
    lastName,
    address,
    city,
    state,
    postalCode,
    phone,
    items,
    deliveryLocation,
    deliveryMethod,
    shippingCost: _clientShippingCost,
    total: _clientTotal, // ignored — we recalculate server-side
  } = await req.json();

  // Required for both pickup and delivery
  if (!email || !firstName || !lastName || !phone || !items) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: "No items in order" },
      { status: 400 },
    );
  }

  const isPickup = deliveryMethod === "pickup" || deliveryLocation === "pickup";

  // Address fields required for delivery only
  if (!isPickup && (!address || !city || !state || !postalCode)) {
    return NextResponse.json(
      { error: "Missing address fields for delivery" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // ---- Resolve delivery location & shipping cost ----
  let resolvedLocationId = deliveryLocation;
  let shippingCost: number;

  if (isPickup) {
    resolvedLocationId = "pickup";
    shippingCost = 0;
  } else {
    const settings = await prisma.setting.findUnique({
      where: { key: "deliveryLocations" },
    });
    const deliveryLocations = normalizeDeliveryLocations(
      settings?.value ?? defaultDeliveryLocations,
    );

    if (!resolvedLocationId) {
      const fullAddress = `${address} ${city} ${state}`;
      const detected = detectDeliveryLocation(fullAddress, deliveryLocations);
      if (detected) {
        resolvedLocationId = detected.id;
      }
    }

    if (!resolvedLocationId) {
      return NextResponse.json(
        { error: "Could not determine delivery location from your address" },
        { status: 400 },
      );
    }

    const cost = getDeliveryCostForLocation(resolvedLocationId, deliveryLocations);
    if (cost === undefined) {
      return NextResponse.json(
        { error: "Invalid delivery location" },
        { status: 400 },
      );
    }
    shippingCost = cost;
  }

  // ---- Aggregate duplicate variantIds into a single quantity per variant ----
  // This prevents a client from bypassing a stock ceiling by submitting the
  // same variant multiple times.
  const itemMap = new Map<
    string,
    { variantId: string; productId?: string; quantity: number; price: number }
  >();

  for (const raw of items) {
    const variantId = raw?.variantId;
    if (typeof variantId !== "string" || !variantId) continue;

    const quantity = Math.floor(Number(raw?.quantity));
    if (!Number.isFinite(quantity) || quantity <= 0) continue;

    const existing = itemMap.get(variantId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      itemMap.set(variantId, {
        variantId,
        productId: typeof raw.productId === "string" ? raw.productId : undefined,
        quantity,
        price: Number(raw?.price) || 0,
      });
    }
  }

  const aggregatedItems = Array.from(itemMap.values());
  if (aggregatedItems.length === 0) {
    return NextResponse.json(
      { error: "No valid items in order" },
      { status: 400 },
    );
  }

  // ---- Fetch active flash sales and resolve item prices ----
  const activeFlashSales = await fetchActiveFlashSales();

  // Fetch all referenced products + variants in one batch
  const variantIds = aggregatedItems.map((item) => item.variantId);
  const productIds = aggregatedItems
    .map((item) => item.productId)
    .filter(Boolean) as string[];

  const [variants, products] = await Promise.all([
    prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      select: { id: true, price: true, productId: true, stock: true, sku: true },
    }),
    prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        basePrice: true,
        salePrice: true,
        categoryId: true,
        subcategoryId: true,
        brandId: true,
      },
    }),
  ]);

  const variantMap = new Map(variants.map((v) => [v.id, v]));
  const productMap = new Map(products.map((p) => [p.id, p]));

  // ---- Server-side stock validation (authoritative) ----
  const shortItems: {
    variantId: string;
    name: string;
    sku: string;
    requested: number;
    available: number;
  }[] = [];

  for (const item of aggregatedItems) {
    const variant = variantMap.get(item.variantId);
    if (!variant) {
      return NextResponse.json(
        {
          error: "One or more items are no longer available",
          invalidVariantId: item.variantId,
        },
        { status: 400 },
      );
    }

    if (item.quantity > variant.stock) {
      const product =
        productMap.get(item.productId ?? "") ??
        productMap.get(variant.productId);
      shortItems.push({
        variantId: item.variantId,
        name: product?.name ?? variant.sku ?? "Item",
        sku: variant.sku ?? "",
        requested: item.quantity,
        available: variant.stock,
      });
    }
  }

  if (shortItems.length > 0) {
    return NextResponse.json(
      { error: "Some items exceed available stock", shortItems },
      { status: 409 },
    );
  }

  // ---- Recalculate each item's price using the flash sale resolver ----
  let calculatedSubtotal = 0;
  let totalDiscount = 0;

  const orderItems = aggregatedItems.map((item) => {
    const variant = variantMap.get(item.variantId);
    const product =
      productMap.get(item.productId ?? "") ??
      (variant ? productMap.get(variant.productId) : undefined);

    if (!product) {
      // Fall back to client-sent price if product not found (shouldn't happen)
      const fallback = item.price * item.quantity;
      calculatedSubtotal += fallback;
      return {
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: fallback,
      };
    }

    const resolved = resolveCheckoutPrice(
      product,
      variant ? { id: variant.id, price: variant.price } : null,
      activeFlashSales,
    );

    const unitPrice = resolved.finalPrice;
    const itemTotal = Math.round(unitPrice * item.quantity * 100) / 100;
    calculatedSubtotal += itemTotal;
    totalDiscount += resolved.discountSaved * item.quantity;

    return {
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice,
      totalPrice: itemTotal,
    };
  });

  const serverTotal = Math.round((calculatedSubtotal + shippingCost) * 100) / 100;

  // ---- Create order + reserve stock atomically ----
  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
      // Atomically decrement stock for each item.  The guarded `stock >= qty`
      // condition means a concurrent checkout that grabbed the last unit will
      // cause this `updateMany` to match 0 rows, which we treat as a shortage
      // and roll back the whole transaction.
      for (const item of aggregatedItems) {
        const decremented = await tx.productVariant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });

        if (decremented.count !== 1) {
          // Re-read live stock to report an accurate "available" figure.
          const fresh = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            select: { stock: true, sku: true },
          });
          const product =
            variantMap.get(item.variantId)?.productId
              ? productMap.get(variantMap.get(item.variantId)!.productId)
              : undefined;
          throw new StockShortageError([
            {
              variantId: item.variantId,
              name: product?.name ?? fresh?.sku ?? "Item",
              sku: fresh?.sku ?? "",
              requested: item.quantity,
              available: fresh?.stock ?? 0,
            },
          ]);
        }
      }

      // Create shipping address (or use pickup placeholder)
      const shippingAddress = isPickup
        ? null
        : await tx.address.create({
            data: {
              firstName,
              lastName,
              addressLine1: address,
              city,
              state,
              postalCode,
              phone,
              country: "Nigeria",
              userId: user.id,
            },
          });

      // Create order (PENDING — no payment yet)
      return tx.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}`,
          status: "PENDING",
          subtotal: Math.round(calculatedSubtotal * 100) / 100,
          shippingCost,
          deliveryLocation: resolvedLocationId,
          discount: Math.round(totalDiscount * 100) / 100,
          total: serverTotal,
          userId: user.id,
          shippingAddressId: shippingAddress?.id ?? undefined,
          items: {
            create: orderItems,
          },
        },
      });
    });
  } catch (error) {
    if (error instanceof StockShortageError) {
      return NextResponse.json(
        { error: "Some items exceed available stock", shortItems: error.shortItems },
        { status: 409 },
      );
    }
    throw error;
  }

  return NextResponse.json({
    orderId: order.id,
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    discount: order.discount,
    total: order.total,
  });
}