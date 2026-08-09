import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { fetchActiveFlashSales, resolveCheckoutPrice } from "@/lib/flashSale"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (id) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { variants: { include: { images: true } }, brand: true, category: true, flashSaleItems: { include: { flashSale: { select: { active: true, startsAt: true, endsAt: true } } } } },
    })
    if (!product) return NextResponse.json(null)
    // Resolve criteria-based flash sale for single product
    const activeSales = await fetchActiveFlashSales()
    const resolved = resolveCheckoutPrice(product, null, activeSales)
    return NextResponse.json({
      ...product,
      _flashSaleResolved: resolved.finalPrice < resolved.originalPrice ? resolved : null,
    })
  }

  const [products, activeSales] = await Promise.all([
    prisma.product.findMany({
      include: {
        variants: { include: { images: true } },
        brand: true,
        flashSaleItems: {
          include: {
            flashSale: { select: { active: true, startsAt: true, endsAt: true } },
          },
        },
      },
    }),
    fetchActiveFlashSales(),
  ])

  // Attach criteria-based flash sale resolution to each product
  const enriched = products.map((product) => {
    const resolved = resolveCheckoutPrice(product, null, activeSales)
    return {
      ...product,
      _flashSaleResolved: resolved.finalPrice < resolved.originalPrice ? resolved : null,
    }
  })

  return NextResponse.json(enriched)
}
