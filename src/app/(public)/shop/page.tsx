import { prisma } from "@/lib/db"
import ProductGrid from "@/components/shared/ProductGrid"
import FilterSidebar from "@/components/shared/FilterSidebar"
import SortDropdown from "@/components/shared/SortDropdown"
import Pagination from "@/components/shared/Pagination"

interface SearchParams {
  page?: string
  sort?: string
  brand?: string
  category?: string
  minPrice?: string
  maxPrice?: string
}

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const page = Number(searchParams.page) || 1
  const limit = 24
  const skip = (page - 1) * limit

  const where: any = { status: "PUBLISHED" }
  if (searchParams.brand) {
    const brandIds = searchParams.brand.split(",")
    where.brandId = { in: brandIds }
  }
  if (searchParams.category) {
    const catIds = searchParams.category.split(",")
    where.categoryId = { in: catIds }
  }
  if (searchParams.minPrice || searchParams.maxPrice) {
    where.basePrice = {}
    if (searchParams.minPrice) where.basePrice.gte = Number(searchParams.minPrice)
    if (searchParams.maxPrice) where.basePrice.lte = Number(searchParams.maxPrice)
  }

  let orderBy: any = { createdAt: "desc" }
  switch (searchParams.sort) {
    case "price_asc": orderBy = { basePrice: "asc" }; break
    case "price_desc": orderBy = { basePrice: "desc" }; break
    case "name_asc": orderBy = { name: "asc" }; break
    default: orderBy = { createdAt: "desc" }
  }

  const [products, total, brands, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { variants: { include: { images: true } }, brand: true },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif mb-6">All Products</h1>
      <div className="flex gap-8">
        <FilterSidebar brands={brands} categories={categories} />
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-500">Showing {products.length} of {total} products</p>
            <SortDropdown />
          </div>
          <ProductGrid products={products as any} />
          <Pagination total={total} limit={limit} currentPage={page} />
        </div>
      </div>
    </div>
  )
}