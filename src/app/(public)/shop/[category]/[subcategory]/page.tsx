import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import ProductGrid from "@/components/shared/ProductGrid"
import Pagination from "@/components/shared/Pagination"

export default async function SubcategoryPage({ params, searchParams }: { params: { category: string, subcategory: string }, searchParams: { page?: string } }) {
  const subcategory = await prisma.subcategory.findUnique({ where: { slug: params.subcategory }, include: { category: true } })
  if (!subcategory || subcategory.category.slug !== params.category) notFound()

  const page = Number(searchParams.page) || 1
  const limit = 24
  const skip = (page - 1) * limit

  const products = await prisma.product.findMany({
    where: { subcategoryId: subcategory.id, status: "PUBLISHED" },
    include: { variants: { include: { images: true } }, brand: true },
    skip,
    take: limit,
  })
  const total = await prisma.product.count({ where: { subcategoryId: subcategory.id, status: "PUBLISHED" } })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif mb-2">{subcategory.name}</h1>
      <p className="text-gray-600 mb-6">{subcategory.description}</p>
      <ProductGrid products={products as any} />
      <Pagination total={total} limit={limit} currentPage={page} />
    </div>
  )
}