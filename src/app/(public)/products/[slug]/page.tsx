export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import ProductDetailClient from "@/components/shared/ProductDetailClient"
import Breadcrumb from "@/components/shared/Breadcrumb"
import { enrichProductsWithFlashSales, fetchActiveFlashSales, resolveCheckoutPrice } from "@/lib/flashSale"
import { getProductUrl, getShopUrl } from "@/lib/utils"
import { resolveProductBySlug } from "@/lib/productQueries"

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const resolved = await resolveProductBySlug(params.slug)
  if (!resolved) notFound()

  const { product, requestedSlug, canonicalProductSlug } = resolved
  if (product.variants.length === 0) notFound()

  if (canonicalProductSlug !== requestedSlug) {
    redirect(`/products/${encodeURIComponent(canonicalProductSlug)}`)
  }

  const activeSales = await fetchActiveFlashSales()
  const flashResolved = resolveCheckoutPrice(product, null, activeSales)
  // Variants can carry their own price, so resolve the sale per variant too —
  // the same way checkout prices them.
  const flashByVariant = Object.fromEntries(
    product.variants.map((variant) => {
      const resolved = resolveCheckoutPrice(product, variant, activeSales)
      return [variant.id, resolved.finalPrice < resolved.originalPrice ? resolved : null]
    }),
  )

  const rawRelated = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, status: "PUBLISHED", variants: { some: { isActive: true } } },
    take: 4,
    include: {
      variants: {
        where: { isActive: true },
        include: { images: true, color: true },
      },
      brand: true,
    },
  })
  const related = await enrichProductsWithFlashSales(rawRelated)

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={[{ name: product.category.name, href: getShopUrl(product.category.slug) }, { name: product.name, href: getProductUrl(product.slug || product.name) }]} />
      <ProductDetailClient
        product={{
          ...product,
          _flashSaleResolved: flashResolved.finalPrice < flashResolved.originalPrice ? flashResolved : null,
          _flashSaleByVariant: flashByVariant,
        }}
        related={related}
      />
    </div>
  )
}
