import { PrismaClient } from "@prisma/client";

/**
 * Release stock for stale PENDING orders.
 *
 * Any `Order` with status `PENDING`, no `paymentReference`, and a `createdAt`
 * older than 30 minutes is cancelled and its reserved stock is returned to the
 * owning variants.
 *
 * Why `paymentReference: null`: there is currently no payment-verification
 * webhook that marks orders `PAID`, so a successfully-paid order could still
 * be `PENDING`.  The `paymentReference: null` guard ensures we only release
 * reservations for orders that never reached the payment step — trading a
 * small leak (gateway-abandoned orders keep their reservation) for never
 * double-selling a unit the customer already paid for.
 *
 * Running:
 *   npm run orders:release-stale
 *
 * Schedule (every 5 minutes) via cron:
 *   star/5 * * * * cd /path/to/lekayo && npm run orders:release-stale
 *   (replace "star" with the asterisk character)
 *
 * Or via PM2 cron-restart:
 *   pm2 start npm --name release-stale --cron "star/5 * * * *" -- run orders:release-stale
 */

const prisma = new PrismaClient();

const STALE_MINUTES = 30;

async function releaseStaleOrders() {
  const cutoff = new Date(Date.now() - STALE_MINUTES * 60 * 1000);

  const staleOrders = await prisma.order.findMany({
    where: {
      status: "PENDING",
      paymentReference: null,
      createdAt: { lt: cutoff },
    },
    include: { items: true },
  });

  if (staleOrders.length === 0) {
    console.log(`No stale PENDING orders older than ${STALE_MINUTES} minutes.`);
    return;
  }

  let cancelled = 0;
  let releasedUnits = 0;

  for (const order of staleOrders) {
    await prisma.$transaction(async (tx) => {
      // Guarded transition: only cancel if the order is still PENDING with no
      // reference.  If another sweep (or a payment) changed it in the meantime,
      // `count` will be 0 and we skip to avoid double-releasing / double-cancel.
      const transitioned = await tx.order.updateMany({
        where: {
          id: order.id,
          status: "PENDING",
          paymentReference: null,
        },
        data: { status: "CANCELLED" },
      });

      if (transitioned.count !== 1) {
        return;
      }

      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
        releasedUnits += item.quantity;
      }

      cancelled++;
    });
  }

  console.log(
    `Released ${releasedUnits} unit(s) across ${cancelled} stale order(s).`,
  );
}

releaseStaleOrders()
  .catch((e) => {
    console.error("Failed to release stale orders:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });