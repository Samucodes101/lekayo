import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { Role } from "@prisma/client"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { fetchActiveFlashSales, resolveCheckoutPrice } from "@/lib/flashSale"
import {
  checkStockAvailability,
  decrementStockOrThrow,
  StockShortageError,
} from "@/lib/stockReservation"

const paymentMethods = ["Cash", "POS/Card", "Bank Transfer"] as const

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== Role.CUSTOMER_SERVICE && session.user.role !== Role.ADMIN && session.user.role !== Role.SUPER_ADMIN)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const items = Array.isArray(body.items) ? body.items : []
  const paymentMethod = body.paymentMethod
  if (!paymentMethods.includes(paymentMethod)) {
    return NextResponse.json({ error: "Invalid payment method" }, { status: 400 })
  }
  if (items.length === 0) {
    return NextResponse.json({ error: "Add at least one item" }, { status: 400 })
  }

  const itemMap = new Map<string, { variantId: string; quantity: number }>()
  for (const item of items) {
    if (typeof item?.variantId !== "string") continue
    const quantity = Math.floor(Number(item.quantity))
    if (!Number.isFinite(quantity) || quantity <= 0) continue
    const existing = itemMap.get(item.variantId)
    if (existing) existing.quantity += quantity
    else itemMap.set(item.variantId, { variantId: item.variantId, quantity })
  }
  const orderItemsInput = Array.from(itemMap.values())
  if (orderItemsInput.length === 0) {
    return NextResponse.json({ error: "No valid items" }, { status: 400 })
  }

  const stock = await checkStockAvailability(orderItemsInput)
  if (stock.shortItems.length > 0) {
    return NextResponse.json(
      { error: "Some items exceed available stock", shortItems: stock.shortItems },
      { status: 409 },
    )
  }

  const activeFlashSales = await fetchActiveFlashSales()
  let subtotal = 0
  let discount = 0
  const orderItems = orderItemsInput.map((item) => {
    const variant = stock.variantMap.get(item.variantId)!
    const product = stock.productMap.get(variant.productId)!
    const resolved = resolveCheckoutPrice(product, variant, activeFlashSales)
    const totalPrice = Math.round(resolved.finalPrice * item.quantity * 100) / 100
    subtotal += totalPrice
    discount += resolved.discountSaved * item.quantity
    return {
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: resolved.finalPrice,
      totalPrice,
    }
  })
  subtotal = Math.round(subtotal * 100) / 100
  discount = Math.round(discount * 100) / 100

  const customerId = typeof body.customerId === "string" ? body.customerId : null
  const name = typeof body.name === "string" ? body.name.trim() : ""
  const phone = typeof body.phone === "string" ? body.phone.trim() : ""
  const email = typeof body.email === "string" ? body.email.trim() : ""
  if (!customerId && (!name || !phone)) {
    return NextResponse.json({ error: "Customer name and phone are required" }, { status: 400 })
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const user = customerId
        ? await tx.user.findUnique({ where: { id: customerId } })
        : await tx.user.create({
            data: {
              name,
              phone,
              email: email || null,
              password: null,
              isWalkIn: true,
            },
          })
      if (!user) throw new Error("Customer not found")

      const order = await tx.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}`,
          status: "PAID",
          paidAt: new Date(),
          paymentMethod,
          subtotal,
          discount,
          shippingCost: 0,
          total: subtotal,
          userId: user.id,
        },
      })

      await decrementStockOrThrow(tx, orderItemsInput)
      await tx.orderItem.createMany({
        data: orderItems.map((item) => ({ ...item, orderId: order.id })),
      })
      return order
    })

    return NextResponse.json({ orderId: order.id })
  } catch (error) {
    if (error instanceof StockShortageError) {
      return NextResponse.json(
        { error: "Some items exceed available stock", shortItems: error.shortItems },
        { status: 409 },
      )
    }
    if (error instanceof Error && error.message === "Customer not found") {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    return NextResponse.json({ error: "Unable to create order" }, { status: 500 })
  }
}
