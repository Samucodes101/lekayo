import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: NextRequest) {
  // Add/increment an item quantity
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { variantId, quantity } = body
  if (!variantId || typeof quantity !== "number") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  await prisma.cartItem.upsert({
    where: { userId_variantId: { userId: user.id, variantId } },
    update: { quantity: { increment: quantity } },
    create: { userId: user.id, variantId, quantity },
  })

  // Return updated cart
  const updatedCart = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: {
      variant: {
        include: { product: true, images: { orderBy: { order: "asc" } }, color: true },
      },
    },
  })

  const cartItems = updatedCart.map((ci) => ({
    variantId: ci.variantId,
    productId: ci.variant.productId,
    name: ci.variant.product.name,
    sku: ci.variant.sku,
    price: ci.variant.price || ci.variant.product.basePrice,
    quantity: ci.quantity,
    stock: ci.variant.stock,
    image: ci.variant.images[0]?.url || "/placeholder.png",
    color: ci.variant.color ? { name: ci.variant.color.name, hex: ci.variant.color.hexCode } : undefined,
    size: ci.variant.sizeValue || undefined,
  }))

  return NextResponse.json({ success: true, cart: cartItems })
}

export async function PUT(req: NextRequest) {
  // Set item quantity
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { variantId, quantity } = body
  if (!variantId || typeof quantity !== "number") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  if (quantity <= 0) {
    // remove item
    await prisma.cartItem.deleteMany({ where: { userId: user.id, variantId } })
  } else {
    await prisma.cartItem.upsert({
      where: { userId_variantId: { userId: user.id, variantId } },
      update: { quantity },
      create: { userId: user.id, variantId, quantity },
    })
  }

  // Return updated cart
  const updatedCart = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: {
      variant: {
        include: { product: true, images: { orderBy: { order: "asc" } }, color: true },
      },
    },
  })

  const cartItems = updatedCart.map((ci) => ({
    variantId: ci.variantId,
    productId: ci.variant.productId,
    name: ci.variant.product.name,
    sku: ci.variant.sku,
    price: ci.variant.price || ci.variant.product.basePrice,
    quantity: ci.quantity,
    stock: ci.variant.stock,
    image: ci.variant.images[0]?.url || "/placeholder.png",
    color: ci.variant.color ? { name: ci.variant.color.name, hex: ci.variant.color.hexCode } : undefined,
    size: ci.variant.sizeValue || undefined,
  }))

  return NextResponse.json({ success: true, cart: cartItems })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { variantId } = body
  if (!variantId) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  await prisma.cartItem.deleteMany({ where: { userId: user.id, variantId } })

  const updatedCart = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: {
      variant: {
        include: { product: true, images: { orderBy: { order: "asc" } }, color: true },
      },
    },
  })

  const cartItems = updatedCart.map((ci) => ({
    variantId: ci.variantId,
    productId: ci.variant.productId,
    name: ci.variant.product.name,
    sku: ci.variant.sku,
    price: ci.variant.price || ci.variant.product.basePrice,
    quantity: ci.quantity,
    stock: ci.variant.stock,
    image: ci.variant.images[0]?.url || "/placeholder.png",
    color: ci.variant.color ? { name: ci.variant.color.name, hex: ci.variant.color.hexCode } : undefined,
    size: ci.variant.sizeValue || undefined,
  }))

  return NextResponse.json({ success: true, cart: cartItems })
}
