export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import ProductDetailClient from "@/components/shared/ProductDetailClient"
import Breadcrumb from "@/components/shared/Breadcrumb"
import { fetchActiveFlashSales, resolveCheckoutPrice } from "@/lib/flashSale"
import { getProductUrl } from "@/lib/utils"
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

  const related = await prisma.product.findMany({
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

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={[{ name: product.category.name, href: `/shop/${product.category.slug}` }, { name: product.name, href: getProductUrl(product.slug || product.name) }]} />
      <ProductDetailClient
        product={{
          ...product,
          _flashSaleResolved: flashResolved.finalPrice < flashResolved.originalPrice ? flashResolved : null,
        }}
        related={related}
      />
    </div>
  )
}
