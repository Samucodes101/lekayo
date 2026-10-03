import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/checkout/order/by-reference?reference=...
 *
 * Public lookup used by the success page to show the just-placed order. The
 * payment reference is a gateway-generated unguessable string, so it doubles
 * as the access token (same trust model as the order id lookup).
 */
export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");
  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { paymentReference: reference },
    include: {
      items: {
        include: {
          variant: {
            include: { product: { select: { name: true } } },
          },
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    subtotal: order.subtotal,
    discount: order.discount,
    shippingCost: order.shippingCost,
    total: order.total,
    items: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      name: item.variant?.product?.name ?? item.variant?.sku ?? "Item",
    })),
  });
}