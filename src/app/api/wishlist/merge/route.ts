import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const mergeSchema = z.object({
  items: z.array(z.object({ id: z.string().cuid() })),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const parsed = mergeSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 })
  }
  const { items } = parsed.data

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Only merge products that actually exist and are published
  const productIds = items.map((i) => i.id)
  const validProducts = await prisma.product.findMany({
    where: { id: { in: productIds }, status: "PUBLISHED" },
    select: { id: true },
  })
  const validIds = new Set(validProducts.map((p) => p.id))

  await prisma.wishlistItem.createMany({
    data: items
      .filter((i) => validIds.has(i.id))
      .map((i) => ({ userId: user.id, productId: i.id })),
    skipDuplicates: true, // relies on your existing @@unique([userId, productId])
  })

  const updatedWishlist = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    include: { product: true },
  })

  const wishlistItems = updatedWishlist.map((w) => ({
    id: w.product.id,
    name: w.product.name,
    slug: w.product.slug,
    price: w.product.salePrice ?? w.product.basePrice,
    image: "", // fill from your product/variant image relation if you display one here
  }))

  return NextResponse.json(wishlistItems)
}