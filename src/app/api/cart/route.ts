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
      cart: {
        include: {
          variant: {
            include: {
              product: true,
              images: true,
              color: true,
            },
          },
        },
      },
    },
  })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Transform to CartItem format
  const items = user.cart.map((ci) => ({
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

  return NextResponse.json(items)
}