export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import ProductGrid from "@/components/shared/ProductGrid"
import FilterSidebar from "@/components/shared/FilterSidebar"
import SortDropdown from "@/components/shared/SortDropdown"
import Pagination from "@/components/shared/Pagination"
import { enrichProductsWithFlashSales } from "@/lib/flashSale"

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { category: string }
  searchParams: { page?: string; sort?: string; brand?: string; minPrice?: string; maxPrice?: string }
}) {
  const category = await prisma.category.findUnique({
    where: { slug: params.category },
    include: { subcategories: true },
  })
  if (!category) notFound()

  const page = Number(searchParams.page) || 1
  const limit = 24
  const skip = (page - 1) * limit
  const brandIds = searchParams.brand?.split(",").filter(Boolean) ?? []
  const minPrice = Number(searchParams.minPrice)
  const maxPrice = Number(searchParams.maxPrice)
  const where: any = {
    categoryId: category.id,
    status: "PUBLISHED",
    ...(brandIds.length > 0 ? { brandId: { in: brandIds } } : {}),
    ...((searchParams.minPrice || searchParams.maxPrice) ? {
      basePrice: {
        ...(Number.isFinite(minPrice) ? { gte: minPrice } : {}),
        ...(Number.isFinite(maxPrice) ? { lte: maxPrice } : {}),
      },
    } : {}),
  }
  const orderBy: any = searchParams.sort === "price_asc"
    ? { basePrice: "asc" }
    : searchParams.sort === "price_desc"
      ? { basePrice: "desc" }
      : searchParams.sort === "name_asc"
        ? { name: "asc" }
        : { createdAt: "desc" }

  const rawProducts = await prisma.product.findMany({
    where,
    include: { variants: { include: { images: true } }, brand: true },
    orderBy,
    skip,
    take: limit,
  })
  const products = await enrichProductsWithFlashSales(rawProducts as any)
  const total = await prisma.product.count({
    where,
  })
  const brands = await prisma.brand.findMany({
    where: { products: { some: { categoryId: category.id, status: "PUBLISHED" } } },
    orderBy: { name: "asc" },
  })

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
      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        <FilterSidebar brands={brands} showCategories={false} />
        <div className="flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-500">Showing {products.length} products</p>
            <SortDropdown />
          </div>
          <ProductGrid products={products as any} />
          <Pagination total={total} limit={limit} currentPage={page} />
        </div>
      </div>
    </div>
  )
}