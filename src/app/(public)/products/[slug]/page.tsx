import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import ProductDetailClient from "@/components/shared/ProductDetailClient"
import Breadcrumb from "@/components/shared/Breadcrumb"
import { fetchActiveFlashSales, resolveCheckoutPrice } from "@/lib/flashSale"

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const [product, activeSales] = await Promise.all([
    prisma.product.findUnique({
      where: { slug: params.slug, status: "PUBLISHED" },
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
    }),
    fetchActiveFlashSales(),
  ])
  if (!product) notFound()

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
      <Breadcrumb items={[{ name: product.category.name, href: `/shop/${product.category.slug}` }, { name: product.name, href: `/products/${product.slug}` }]} />
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
