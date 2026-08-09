import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { initializePayment } from "@/lib/paystack";
import { initializeFlutterwavePayment } from "@/lib/flutterwave";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * POST /api/checkout/pay
 *
 * Initializes payment for an existing order.  The order must already have
 * been created via /api/checkout/init.
 *
 * Body: { orderId: string, paymentGateway: "PAYSTACK" | "FLUTTERWAVE" }
 * Returns: { authorizationUrl: string, reference: string }
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId, paymentGateway } = await req.json();

  if (!orderId) {
    return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      shippingAddress: true,
      items: { include: { variant: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Ensure the order belongs to the authenticated user
  if (order.user.email !== session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Don't re-initialize payment for orders that are already paid
  if (order.status === "PAID") {
    return NextResponse.json(
      { error: "This order has already been paid" },
      { status: 400 },
    );
  }

  const email = order.user.email;
  const paymentData = {
    email,
    firstName: order.shippingAddress?.firstName ?? "",
    lastName: order.shippingAddress?.lastName ?? "",
    phone: order.shippingAddress?.phone ?? "",
    orderId: order.id,
    deliveryLocation: order.deliveryLocation ?? "",
  };

  let payment;
  if (paymentGateway === "FLUTTERWAVE") {
    payment = await initializeFlutterwavePayment(
      email,
      order.total,
      paymentData,
    );
  } else {
    payment = await initializePayment(email, order.total, paymentData);
  }

  if (!payment || !payment.authorization_url) {
    return NextResponse.json(
      { error: "Payment initialization failed" },
      { status: 500 },
    );
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentReference: payment.reference,
      paymentMethod: paymentGateway || "PAYSTACK",
    },
  });

  return NextResponse.json({
    authorizationUrl: payment.authorization_url,
    reference: payment.reference,
  });
}
