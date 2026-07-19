import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import ProductDetailClient from "@/components/shared/ProductDetailClient"
import Breadcrumb from "@/components/shared/Breadcrumb"

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug, status: "PUBLISHED" },
    include: {
      brand: true,
      category: true,
      variants: {
        include: {
          images: true,
          color: true,      // ✅ include color
        },
      },
    },
  })
  if (!product) notFound()

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
      <ProductDetailClient product={product} related={related} />
    </div>
  )
}