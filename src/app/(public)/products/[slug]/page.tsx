export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import ProductDetailClient from "@/components/shared/ProductDetailClient"
import Breadcrumb from "@/components/shared/Breadcrumb"
import { fetchActiveFlashSales, resolveCheckoutPrice } from "@/lib/flashSale"
import { generateSlug, getProductUrl } from "@/lib/utils"

export default async function ProductPage({ params }: { params: { slug: string } }) {
  let decodedSlug = params.slug
  try {
    decodedSlug = decodeURIComponent(params.slug)
  } catch {
    decodedSlug = params.slug
  }

  const requestedSlug = generateSlug(decodedSlug)
  const [productKey, activeSales] = await Promise.all([
    prisma.product.findFirst({
      where: {
        status: "PUBLISHED",
        OR: [{ slug: params.slug }, { slug: decodedSlug }, { slug: requestedSlug }],
      },
      select: { id: true, slug: true, name: true },
    }).then(async (exactProduct) => {
      if (exactProduct) return exactProduct

      const publishedProducts = await prisma.product.findMany({
        where: { status: "PUBLISHED" },
        select: { id: true, slug: true, name: true },
      })

      return publishedProducts.find((candidate) =>
        generateSlug(candidate.slug) === requestedSlug || generateSlug(candidate.name) === requestedSlug,
      ) ?? null
    }),
    fetchActiveFlashSales(),
  ])

  const product = productKey
    ? await prisma.product.findUnique({
        where: { id: productKey.id },
        include: {
          brand: true,
          category: true,
          variants: {
            include: {
              images: true,
              color: true,
            },
          },
          flashSaleItems: {
            include: {
              flashSale: { select: { active: true, startsAt: true, endsAt: true } },
            },
          },
        },
      })
    : null
  if (!product) notFound()

  const canonicalProductSlug = generateSlug(product.slug)
  if (canonicalProductSlug !== requestedSlug) {
    redirect(`/products/${encodeURIComponent(canonicalProductSlug)}`)
  }

  // Resolve criteria-based flash sale discount (category/brand/all)
  const flashResolved = resolveCheckoutPrice(product, null, activeSales)

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, status: "PUBLISHED" },
    take: 4,
    include: {
      variants: {
        include: {
          images: true,
          color: true,
        },
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
