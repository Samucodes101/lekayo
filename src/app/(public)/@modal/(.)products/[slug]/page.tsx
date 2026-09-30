export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { fetchActiveFlashSales, resolveCheckoutPrice } from "@/lib/flashSale"
import { resolveProductBySlug } from "@/lib/productQueries"
import ProductModal from "@/components/shared/ProductModal"

export default async function ProductModalPage({ params }: { params: { slug: string } }) {
  const resolved = await resolveProductBySlug(params.slug)
  if (!resolved) notFound()
  const { product } = resolved
  if (product.variants.length === 0) notFound()

  const activeSales = await fetchActiveFlashSales()
  const flashResolved = resolveCheckoutPrice(product, null, activeSales)

  return (
    <ProductModal
      product={{
        ...product,
        _flashSaleResolved: flashResolved.finalPrice < flashResolved.originalPrice ? flashResolved : null,
      }}
    />
  )
}
