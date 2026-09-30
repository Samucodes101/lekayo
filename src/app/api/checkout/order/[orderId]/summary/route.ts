import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/checkout/order/[orderId]/summary
 *
 * Returns order details for the given order.  Used by the payment page to
 * display the order summary before the user selects a payment method.  The
 * order id is an unguessable cuid shown only to the customer who just placed
 * the order, so no session is required.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { orderId: string } },
) {
  const { orderId } = await params;
  if (!orderId) {
    return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: { select: { name: true } },
            },
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
      name:
        item.variant?.product?.name ??
        item.variant?.sku ??
        "Item",
    })),
  });
}