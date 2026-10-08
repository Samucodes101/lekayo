import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  findDeliveryOption,
  normalizeDeliveryStates,
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
 * Stock is **checked** server-side here (409 if any item is short) but not
 * deducted: an unpaid order holds no inventory.  Stock is re-checked when
 * payment is initialized (/api/checkout/pay) and deducted only once the
 * payment gateway confirms the charge (see markOrderPaid).
 */

async function handleCheckoutInit(req: NextRequest) {
  const session = await getServerSession(authOptions);

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

  // Link the order to the signed-in user when available. Guests check out
  // without an account; their contact details are stored on the order itself.
  const user = session?.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email } })
    : null;

  // ---- Resolve delivery location & shipping cost ----
  let resolvedLocationId = deliveryLocation;
  let shippingCost: number;

  if (isPickup) {
    resolvedLocationId = "pickup";
    shippingCost = 0;
  } else {
    const settings = await prisma.setting.findMany({
      where: {
        key: { in: ["deliveryStates", "deliveryLocations", "deliveryTimeframe"] },
      },
    });
    const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    const deliveryStates = normalizeDeliveryStates(
      settingsMap.deliveryStates,
      settingsMap.deliveryLocations,
      settingsMap.deliveryTimeframe,
    );

    const match = findDeliveryOption(
      deliveryStates,
      String(state ?? ""),
      String(deliveryLocation ?? ""),
    );
    if (!match) {
      return NextResponse.json(
        { error: "Please select a valid shipping method for your state" },
        { status: 400 },
      );
    }
    resolvedLocationId = `${match.state.name} — ${match.option.label}`;
    shippingCost = match.option.cost;
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
      where: { id: { in: variantIds }, isActive: true },
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

  // ---- Create order (stock is deducted on payment confirmation) ----
  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
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
              userId: user?.id ?? null,
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
          email,
          customerName: `${firstName} ${lastName}`.trim(),
          customerPhone: phone,
          userId: user?.id ?? null,
          shippingAddressId: shippingAddress?.id ?? undefined,
          items: {
            create: orderItems,
          },
        },
      });
    });
  } catch (error) {
    console.error("checkout/init failed:", error);
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

/**
 * Top-level wrapper: nothing thrown anywhere in the handler (body parsing,
 * session, DB lookups, price resolution, transaction) can escape unlogged.
 * The requestId is returned to the client so a failure report can be matched
 * to its log entry.
 */
export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  try {
    return await handleCheckoutInit(req);
  } catch (error) {
    console.error(`[checkout/init] ${requestId} unhandled error:`, {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      // Prisma errors carry a code (e.g. P2002, P2034) and meta
      code: (error as any)?.code,
      meta: (error as any)?.meta,
    });
    return NextResponse.json(
      { error: "Internal server error", requestId },
      { status: 500 },
    );
  }
}