import { NextRequest, NextResponse } from "next/server"
import { initializePayment } from "@/lib/paystack"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { email, firstName, lastName, address, city, state, postalCode, phone, items, total } = await req.json()

  // Create order in PENDING state
  const user = await prisma.user.findUnique({ where: { email: session.user.email! } })
  const order = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}`,
      status: "PENDING",
      subtotal: total,
      total,
      userId: user!.id,
      items: { create: items.map((item: any) => ({ variantId: item.variantId, quantity: item.quantity, unitPrice: item.price, totalPrice: item.price * item.quantity })) },
      shippingAddress: { create: { firstName, lastName, addressLine1: address, city, state, postalCode, phone, userId: user!.id } },
    },
  })

  const payment = await initializePayment(email, total, { orderId: order.id })
  await prisma.order.update({ where: { id: order.id }, data: { paymentReference: payment.reference } })

  return NextResponse.json({ authorizationUrl: payment.authorization_url, reference: payment.reference })
}