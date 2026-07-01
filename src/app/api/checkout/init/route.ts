import { NextRequest, NextResponse } from "next/server"
import { initializePayment } from "@/lib/paystack"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { email, firstName, lastName, address, city, state, postalCode, phone, items, total } = await req.json()

  // Create order in PENDING state
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  const shippingAddress = await prisma.address.create({
    data: {
      firstName,
      lastName,
      addressLine1: address,
      city,
      state,
      postalCode,
      country: "Nigeria",
      phone,
      userId: user!.id,
    },
  })
  const order = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}`,
      status: "PENDING",
      subtotal: total,
      total,
      userId: user!.id,
      shippingAddressId: shippingAddress.id,
      items: { create: items.map((item: any) => ({ variantId: item.variantId, quantity: item.quantity, unitPrice: item.price, totalPrice: item.price * item.quantity })) },
    },
  })

  const payment = await initializePayment(email, total, { orderId: order.id })
  await prisma.order.update({ where: { id: order.id }, data: { paymentReference: payment.reference } })

  return NextResponse.json({ authorizationUrl: payment.authorization_url, reference: payment.reference })
}