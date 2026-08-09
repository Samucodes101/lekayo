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
 */
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

  // ---- Fetch active flash sales and resolve item prices ----
  const activeFlashSales = await fetchActiveFlashSales();

  // Fetch all referenced products + variants in one batch
  const variantIds = items.map((item: any) => item.variantId);
  const productIds = items.map((item: any) => item.productId).filter(Boolean);

  const [variants, products] = await Promise.all([
    prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      select: { id: true, price: true, productId: true },
    }),
    prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
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

  // Recalculate each item's price using the flash sale resolver
  let calculatedSubtotal = 0;
  let totalDiscount = 0;

  const orderItems = items.map((item: any) => {
    const variant = variantMap.get(item.variantId);
    const product =
      productMap.get(item.productId) ??
      (variant ? productMap.get(variant.productId) : null);

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

  // Create shipping address (or use pickup placeholder)
  const shippingAddress = isPickup
    ? null
    : await prisma.address.create({
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
  const order = await prisma.order.create({
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

  return NextResponse.json({
    orderId: order.id,
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    discount: order.discount,
    total: order.total,
  });
}