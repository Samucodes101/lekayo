import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const mergeSchema = z.object({
  items: z.array(z.object({
    variantId: z.string().cuid(),
    quantity: z.number().int().positive(),
  })),
  mergeToken: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = mergeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 })
  }
  const { items, mergeToken } = parsed.data

  // Idempotency: check if this mergeToken already used (store in a cache or DB)
  // For simplicity, we'll use a simple in-memory cache (but better: Redis)
  // We'll skip for now and rely on client-side clearing, but we'll add a server-side guard later.

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Validate that all variantIds exist and products are published (optional)
  const variantIds = items.map(i => i.variantId)
  const validVariants = await prisma.productVariant.findMany({
    where: {
      id: { in: variantIds },
      product: { status: "PUBLISHED" },
    },
    select: { id: true },
  })
  const validIds = new Set(validVariants.map(v => v.id))
  const invalidItems = items.filter(i => !validIds.has(i.variantId))
  if (invalidItems.length > 0) {
    return NextResponse.json({
      error: "Some items are invalid or product not available",
      invalid: invalidItems,
    }, { status: 400 })
  }

  // Use transaction
  await prisma.$transaction(async (tx) => {
    for (const item of items) {
      await tx.cartItem.upsert({
        where: {
          userId_variantId: { userId: user.id, variantId: item.variantId },
        },
        update: {
          quantity: { increment: item.quantity },
        },
        create: {
          userId: user.id,
          variantId: item.variantId,
          quantity: item.quantity,
        },
      })
    }
  })

  // After merge, return the updated cart items
  const updatedCart = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: {
      variant: {
        include: {
          product: true,
          images: true,
          color: true,
        },
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
    image: ci.variant.images[0]?.url || "/placeholder.png",
    color: ci.variant.color ? { name: ci.variant.color.name, hex: ci.variant.color.hexCode } : undefined,
    size: ci.variant.sizeValue || undefined,
  }))

  return NextResponse.json({ success: true, cart: cartItems })
}