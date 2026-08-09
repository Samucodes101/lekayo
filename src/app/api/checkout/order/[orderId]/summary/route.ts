import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/checkout/order/[orderId]/summary
 *
 * Returns order details for the authenticated user's order.  Used by the
 * payment page to display the order summary before the user selects a
 * payment method.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { orderId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  // Only the order owner (or an admin) may view the order
  if (order.userId !== session.user.id) {
    return NextResponse.json({ error: "Not your order" }, { status: 403 });
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