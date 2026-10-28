import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { enrichProductsWithFlashSales } from "@/lib/flashSale"

export const dynamic = "force-dynamic"

// POST live product data for wishlist ids. Works for guests and signed-in users,
// so the wishlist always shows current prices and active flash sales rather than
// the snapshot stored when the item was added.
export async function POST(req: NextRequest) {
  const { ids } = (await req.json().catch(() => ({}))) as { ids?: unknown }
  if (!Array.isArray(ids) || ids.length === 0) return NextResponse.json([])

  const productIds = ids.filter((id): id is string => typeof id === "string").slice(0, 200)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, status: "PUBLISHED" },
    include: {
      variants: { where: { isActive: true }, include: { images: true }, orderBy: { order: "asc" } },
      brand: true,
    },
  })

  // Preserve the order items were added to the wishlist
  const byId = new Map(products.map((p) => [p.id, p]))
  const ordered = productIds.map((id) => byId.get(id)).filter((p): p is NonNullable<typeof p> => Boolean(p))
  return NextResponse.json(await enrichProductsWithFlashSales(ordered))
}
