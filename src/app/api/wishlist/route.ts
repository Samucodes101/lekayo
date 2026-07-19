import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      wishlist: {
        include: {
          product: {
            include: {
              variants: { include: { images: true } },
            },
          },
        },
      },
    },
  })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const items = user.wishlist.map((w) => ({
    id: w.productId,
    name: w.product.name,
    slug: w.product.slug,
    price: w.product.salePrice || w.product.basePrice,
    image: w.product.variants[0]?.images[0]?.url || "/placeholder.png",
  }))

  return NextResponse.json(items)
}