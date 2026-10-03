import { NextRequest, NextResponse } from "next/server";
import { markOrderPaid } from "@/lib/orders";
import { sendOrderConfirmation } from "@/lib/notifications";

/**
 * POST /api/webhooks/flutterwave
 *
 * Marks orders PAID when Flutterwave reports a successful charge. Verified via
 * the `verif-hash` header, which must equal FLUTTERWAVE_SECRET_HASH.
 */
export async function POST(req: NextRequest) {
  const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
  const signature = req.headers.get("verif-hash");

  if (!secretHash || !signature || signature !== secretHash) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = payload?.data;
  if (
    payload?.event === "charge.completed" &&
    data?.status === "successful" &&
    typeof data?.tx_ref === "string"
  ) {
    const order = await markOrderPaid(data.tx_ref, {
      gateway: "FLUTTERWAVE",
      paidAt: data?.paid_at || data?.created_at || null,
      amountNaira:
        typeof data?.amount === "number" ? data.amount : Number(data?.amount) || null,
      currency: data?.currency || null,
    });

    if (order) {
      void sendOrderConfirmation(order).catch((error) =>
        console.error("[notify] flutterwave", error),
      );
    }
  }

  return NextResponse.json({ received: true });
}