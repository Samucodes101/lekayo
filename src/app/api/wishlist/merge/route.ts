import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const mergeSchema = z.object({
  items: z.array(z.object({
    id: z.string().cuid(),
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
  const { items } = parsed.data

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Validate product ids exist and published
  const productIds = items.map(i => i.id)
  const validProducts = await prisma.product.findMany({
    where: { id: { in: productIds }, status: "PUBLISHED" },
    select: { id: true },
  })
  const validIds = new Set(validProducts.map(p => p.id))
  const invalidItems = items.filter(i => !validIds.has(i.id))
  if (invalidItems.length > 0) {
    return NextResponse.json({
      error: "Some products are invalid or not available",
      invalid: invalidItems,
    }, { status: 400 })
  }

  // Use createMany with skipDuplicates (requires unique constraint)
  await prisma.$transaction(async (tx) => {
    await tx.wishlistItem.createMany({
      data: items.map((item) => ({
        userId: user.id,
        productId: item.id,
      })),
      skipDuplicates: true,
    })
  })

  // Return updated wishlist
  const updatedWishlist = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    include: {
      product: {
        include: {
          variants: { include: { images: true } },
        },
      },
    },
  })

  const wishlistItems = updatedWishlist.map((w) => ({
    id: w.productId,
    name: w.product.name,
    slug: w.product.slug,
    price: w.product.salePrice || w.product.basePrice,
    image: w.product.variants[0]?.images[0]?.url || "/placeholder.png",
  }))

  return NextResponse.json({ success: true, wishlist: wishlistItems })
}