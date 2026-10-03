import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

const orderWithDetails = Prisma.validator<Prisma.OrderInclude>()({
  items: { include: { variant: { include: { product: true } } } },
  shippingAddress: true,
});

export type OrderWithDetails = Prisma.OrderGetPayload<{
  include: typeof orderWithDetails;
}>;

/**
 * Marks an order as PAID using its payment reference.
 * Idempotent: repeated webhook deliveries never double-process.
 */
export async function markOrderPaid(
  reference: string,
  opts: {
    gateway: string;
    paidAt?: Date | string | null;
    amountNaira?: number | null;
    currency?: string | null;
  },
): Promise<OrderWithDetails | null> {
  if (!reference) return null;

  const order = await prisma.order.findFirst({
    where: { paymentReference: reference },
    include: orderWithDetails,
  });

  if (!order) {
    console.warn(`[payments] no order for reference "${reference}"`);
    return null;
  }

  if (order.status === "PAID") {
    return order;
  }

  // Amount is a sanity log only: the request is already signature-verified.
  if (opts.amountNaira != null && order.total != null) {
    const expected = Math.round(order.total * 100) / 100;
    const received = Math.round(Number(opts.amountNaira) * 100) / 100;
    if (received !== expected) {
      console.warn(
        `[payments] amount mismatch ${order.orderNumber}: expected ${expected} ${opts.currency ?? "NGN"}, got ${received}`,
      );
    }
  }

  const paidAt = opts.paidAt ? new Date(opts.paidAt) : new Date();

  return prisma.order.update({
    where: { id: order.id },
    data: {
      status: "PAID",
      paidAt,
      paymentMethod: order.paymentMethod || opts.gateway,
    },
    include: orderWithDetails,
  });
}