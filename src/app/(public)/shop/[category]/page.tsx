import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import ProductGrid from "@/components/shared/ProductGrid"
import FilterSidebar from "@/components/shared/FilterSidebar"
import Pagination from "@/components/shared/Pagination"

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { category: string }
  searchParams: { page?: string }
}) {
  const category = await prisma.category.findUnique({
    where: { slug: params.category },
    include: { subcategories: true },
  })
  if (!category) notFound()

  const page = Number(searchParams.page) || 1
  const limit = 24
  const skip = (page - 1) * limit

  const products = await prisma.product.findMany({
    where: { categoryId: category.id, status: "PUBLISHED" },
    include: { variants: { include: { images: true } }, brand: true },
    skip,
    take: limit,
  })
  const total = await prisma.product.count({
    where: { categoryId: category.id, status: "PUBLISHED" },
  })
  const brands = await prisma.brand.findMany()

  return (
    <div className="container mx-auto px-4 py-8">
      {category.banner && (
        <div
          className="h-48 bg-cover bg-center rounded-lg mb-6"
          style={{ backgroundImage: `url(${category.banner})` }}
        />
      )}
      <h1 className="text-3xl font-serif mb-2">{category.name}</h1>
      <p className="text-gray-600 mb-6">{category.description}</p>
      <div className="flex gap-8">
        {/* ✅ removed onFilterChange prop – FilterSidebar now handles filters internally via URL */}
        <FilterSidebar brands={brands} categories={[]} />
        <div className="flex-1">
          <ProductGrid products={products as any} />
          <Pagination total={total} limit={limit} currentPage={page} />
        </div>
      </div>
    </div>
  )
}