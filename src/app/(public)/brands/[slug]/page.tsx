export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import ProductGrid from "@/components/shared/ProductGrid"
import FilterSidebar from "@/components/shared/FilterSidebar"
import SortDropdown from "@/components/shared/SortDropdown"
import Pagination from "@/components/shared/Pagination"
import Image from "next/image"
import { enrichProductsWithFlashSales } from "@/lib/flashSale"

export default async function BrandPage({ params, searchParams }: { params: { slug: string }; searchParams: { page?: string; sort?: string; category?: string; minPrice?: string; maxPrice?: string } }) {
  const brand = await prisma.brand.findUnique({
    where: { slug: params.slug },
  })
  if (!brand) notFound()

  const page = Number(searchParams.page) || 1
  const limit = 24
  const skip = (page - 1) * limit
  const categoryIds = searchParams.category?.split(",").filter(Boolean) ?? []
  const minPrice = Number(searchParams.minPrice)
  const maxPrice = Number(searchParams.maxPrice)
  const where: any = {
    brandId: brand.id,
    status: "PUBLISHED",
    ...(categoryIds.length > 0 ? { categoryId: { in: categoryIds } } : {}),
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
  const [rawProducts, total, categories] = await Promise.all([
    prisma.product.findMany({ where, orderBy, skip, take: limit, include: { variants: { include: { images: true } }, brand: true } }),
    prisma.product.count({ where }),
    prisma.category.findMany({ where: { products: { some: { brandId: brand.id, status: "PUBLISHED" } } }, orderBy: { name: "asc" } }),
  ])
  const products = await enrichProductsWithFlashSales(rawProducts as any)

  return (
    <div className="container mx-auto px-4 py-8">
      {brand.banner && (
        <div className="relative h-64 w-full rounded-xl overflow-hidden mb-8">
          <Image src={brand.banner} alt={brand.name} fill className="object-cover" />
        </div>
      )}
      <h1 className="text-3xl font-serif mb-2">{brand.name}</h1>
      <p className="text-gray-600 mb-6">{brand.description}</p>
      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        <FilterSidebar categories={categories} showBrands={false} />
        <div className="flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
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
