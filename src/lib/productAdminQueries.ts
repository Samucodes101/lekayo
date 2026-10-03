import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"
import type { ProductRow } from "@/components/admin/ProductList"

export const PRODUCTS_PAGE_SIZE = 25

type SP = Record<string, string | string[] | undefined>

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined

const toNaira = (v: string | undefined) => {
  if (!v) return undefined
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 ? n : undefined
}

export async function queryProducts(sp: SP) {
  const q = one(sp.q)?.trim()
  const brand = one(sp.brand)
  const category = one(sp.category)
  const subcategory = one(sp.subcategory)
  const status = one(sp.status)
  const featured = one(sp.featured)
  const sort = one(sp.sort) ?? "newest"
  const min = toNaira(one(sp.min))
  const max = toNaira(one(sp.max))
  const requestedPage = Math.max(1, Number(one(sp.page)) || 1)

  // ---- Base filters (everything except status, so stats stay meaningful) ----
  const and: Prisma.ProductWhereInput[] = []

  if (q) {
    and.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { sku: { contains: q, mode: "insensitive" } },
        { brand: { name: { contains: q, mode: "insensitive" } } },
        { category: { name: { contains: q, mode: "insensitive" } } },
      ],
    })
  }
  if (brand) and.push({ brandId: brand })
  if (category) and.push({ categoryId: category })
  if (subcategory) and.push({ subcategoryId: subcategory })
  if (featured === "true") and.push({ featured: true })
  else if (featured === "false") and.push({ featured: false })

  // Effective price = salePrice ?? basePrice
  if (min !== undefined || max !== undefined) {
    const range: Prisma.FloatFilter = {}
    if (min !== undefined) range.gte = min
    if (max !== undefined) range.lte = max
    and.push({
      OR: [
        { salePrice: range },
        { salePrice: null, basePrice: range },
      ],
    })
  }

  const baseWhere: Prisma.ProductWhereInput = and.length ? { AND: and } : {}

  const statusWhere: Prisma.ProductWhereInput =
    status === "PUBLISHED" || status === "DRAFT" || status === "ARCHIVED" ? { status } : {}

  const where: Prisma.ProductWhereInput = { AND: [baseWhere, statusWhere] }

  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    sort === "name"
      ? [{ name: "asc" }, { id: "asc" }]
      : sort === "name_desc"
        ? [{ name: "desc" }, { id: "asc" }]
        : [{ createdAt: "desc" }, { id: "asc" }]

  // ---- Queries (parallel) ----
  const [baseCount, publishedCount, draftCount, archivedCount, brands, categories] =
    await Promise.all([
      prisma.product.count({ where: baseWhere }),
      prisma.product.count({ where: { AND: [baseWhere, { status: "PUBLISHED" }] } }),
      prisma.product.count({ where: { AND: [baseWhere, { status: "DRAFT" }] } }),
      prisma.product.count({ where: { AND: [baseWhere, { status: "ARCHIVED" }] } }),
      prisma.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
      prisma.category.findMany({
        select: {
          id: true,
          name: true,
          subcategories: { select: { id: true, name: true }, orderBy: { name: "asc" } },
        },
        orderBy: { name: "asc" },
      }),
    ])

  const filteredCount =
    status === "PUBLISHED"
      ? publishedCount
      : status === "DRAFT"
        ? draftCount
        : status === "ARCHIVED"
          ? archivedCount
          : baseCount

  const totalPages = Math.max(1, Math.ceil(filteredCount / PRODUCTS_PAGE_SIZE))
  const page = Math.min(requestedPage, totalPages)

  const products = await prisma.product.findMany({
    where,
    orderBy,
    skip: (page - 1) * PRODUCTS_PAGE_SIZE,
    take: PRODUCTS_PAGE_SIZE,
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      status: true,
      featured: true,
      basePrice: true,
      salePrice: true,
      brand: { select: { name: true } },
      category: { select: { name: true } },
      subcategory: { select: { name: true } },
      variants: {
        select: {
          stock: true,
          images: { take: 1, orderBy: { order: "asc" }, select: { url: true } },
        },
      },
    },
  })

  const rows: ProductRow[] = products.map((p) => {
    const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0)
    const image = p.variants.find((v) => v.images.length > 0)?.images[0]?.url ?? null
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      sku: p.sku,
      status: p.status,
      featured: p.featured,
      basePrice: p.basePrice,
      salePrice: p.salePrice,
      brand: p.brand.name,
      category: p.category.name,
      subcategory: p.subcategory?.name ?? null,
      variantCount: p.variants.length,
      totalStock,
      image,
    }
  })

  const stats = [
    { label: "Products", value: baseCount },
    { label: "Published", value: publishedCount },
    { label: "Draft", value: draftCount },
    { label: "Archived", value: archivedCount },
  ]

  // ---- Pagination links keep all active filters ----
  const pageHref = (p: number) => {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(sp)) {
      const val = one(v)
      if (val && k !== "page") params.set(k, val)
    }
    if (p > 1) params.set("page", String(p))
    const qs = params.toString()
    return qs ? `?${qs}` : "?"
  }

  return { stats, brands, categories, rows, page, totalPages, filteredCount, pageHref }
}
