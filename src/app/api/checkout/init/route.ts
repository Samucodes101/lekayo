import { NextRequest, NextResponse } from "next/server"
import { initializePayment } from "@/lib/paystack"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { email, firstName, lastName, address, city, state, postalCode, phone, items, total } = await req.json()

  if (!email || !firstName || !lastName || !address || !city || !state || !postalCode || !phone || !items || !total) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Create shipping address
  const shippingAddress = await prisma.address.create({
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
  })

  // Create order
  const order = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}`,
      status: "PENDING",
      subtotal: total,
      total,
      userId: user.id,
      shippingAddressId: shippingAddress.id,
      items: {
        create: items.map((item: any) => ({
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
        })),
      },
    },
  })

  const payment = await initializePayment(email, total, { orderId: order.id })
  if (!payment || !payment.authorization_url) {
    return NextResponse.json({ error: "Payment initialization failed" }, { status: 500 })
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentReference: payment.reference },
  })

  return NextResponse.json({
    authorizationUrl: payment.authorization_url,
    reference: payment.reference,
  })
}