import { prisma } from "@/lib/db"
import ProductGrid from "@/components/shared/ProductGrid"
import { enrichProductsWithFlashSales } from "@/lib/flashSale"

export default async function FeaturedPage() {
  const rawProducts = await prisma.product.findMany({
    where: { featured: true, status: "PUBLISHED" },
    include: { variants: { include: { images: true } }, brand: true },
  })
  const products = await enrichProductsWithFlashSales(rawProducts as any)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif mb-8">Featured Products</h1>
      <ProductGrid products={products as any} />
    </div>
  )
}
