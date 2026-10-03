import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { markOrderPaid } from "@/lib/orders";
import { sendOrderConfirmation } from "@/lib/notifications";

/**
 * POST /api/webhooks/paystack
 *
 * Marks orders PAID when Paystack reports a successful charge. Paystack signs
 * each webhook with HMAC-SHA512 of the raw body using the Paystack secret key,
 * exposed as the `x-paystack-signature` header.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret) {
    console.error("[paystack webhook] PAYSTACK_SECRET_KEY not set");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
  if (!signature || signature.toLowerCase() !== expected.toLowerCase()) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = payload?.data;
  if (
    payload?.event === "charge.success" &&
    data?.status === "success" &&
    typeof data?.reference === "string"
  ) {
    const order = await markOrderPaid(data.reference, {
      gateway: "PAYSTACK",
      paidAt: data?.paid_at || null,
      amountNaira: typeof data?.amount === "number" ? data.amount / 100 : null,
      currency: data?.currency || null,
    });

    if (order) {
      void sendOrderConfirmation(order).catch((error) =>
        console.error("[notify] paystack", error),
      );
    }
  }

  return NextResponse.json({ received: true });
}