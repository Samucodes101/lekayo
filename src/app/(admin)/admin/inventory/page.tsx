import Link from "next/link"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { InventoryTable, type InventoryRow } from "@/components/admin/InventoryTable"
import { InventoryFilters } from "@/components/admin/InventoryFilters"

const PAGE_SIZE = 25
const LOW_STOCK_THRESHOLD = 5

type SP = Record<string, string | string[] | undefined>

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined

const toNaira = (v: string | undefined) => {
  if (!v) return undefined
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 ? n : undefined
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<SP> | SP
}) {
  const sp = await searchParams

  const q = one(sp.q)?.trim()
  const brand = one(sp.brand)
  const category = one(sp.category)
  const subcategory = one(sp.subcategory)
  const color = one(sp.color)
  const status = one(sp.status) // "in" | "low" | "out"
  const sort = one(sp.sort) ?? "stock_asc"
  const min = toNaira(one(sp.min))
  const max = toNaira(one(sp.max))
  const requestedPage = Math.max(1, Number(one(sp.page)) || 1)

  // ---- Base filters (everything except stock status, so stats stay meaningful) ----
  const and: Prisma.ProductVariantWhereInput[] = []

  if (q) {
    and.push({
      OR: [
        { sku: { contains: q, mode: "insensitive" } },
        { product: { name: { contains: q, mode: "insensitive" } } },
      ],
    })
  }
  if (brand) and.push({ product: { brandId: brand } })
  if (category) and.push({ product: { categoryId: category } })
  if (subcategory) and.push({ product: { subcategoryId: subcategory } })
  if (color) and.push({ colorId: color })

  // Effective price = variant price, else product sale price, else base price
  if (min !== undefined || max !== undefined) {
    const range: Prisma.FloatFilter = {}
    if (min !== undefined) range.gte = min
    if (max !== undefined) range.lte = max
    and.push({
      OR: [
        { price: range },
        { price: null, product: { salePrice: range } },
        { price: null, product: { salePrice: null, basePrice: range } },
      ],
    })
  }

  const baseWhere: Prisma.ProductVariantWhereInput = and.length ? { AND: and } : {}

  const statusWhere: Prisma.ProductVariantWhereInput =
    status === "out"
      ? { stock: { lte: 0 } }
      : status === "low"
        ? { stock: { gt: 0, lte: LOW_STOCK_THRESHOLD } }
        : status === "in"
          ? { stock: { gt: LOW_STOCK_THRESHOLD } }
          : {}

  const where: Prisma.ProductVariantWhereInput = { AND: [baseWhere, statusWhere] }

  const orderBy: Prisma.ProductVariantOrderByWithRelationInput[] =
    sort === "stock_desc"
      ? [{ stock: "desc" }, { id: "asc" }]
      : sort === "name"
        ? [{ product: { name: "asc" } }, { id: "asc" }]
        : [{ stock: "asc" }, { id: "asc" }]

  // ---- Queries (parallel) ----
  const [baseCount, outCount, lowCount, brands, categories, colors] = await Promise.all([
    prisma.productVariant.count({ where: baseWhere }),
    prisma.productVariant.count({ where: { AND: [baseWhere, { stock: { lte: 0 } }] } }),
    prisma.productVariant.count({
      where: { AND: [baseWhere, { stock: { gt: 0, lte: LOW_STOCK_THRESHOLD } }] },
    }),
    prisma.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
        subcategories: { select: { id: true, name: true }, orderBy: { name: "asc" } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.color.findMany({
      select: { id: true, name: true, hexCode: true },
      orderBy: { name: "asc" },
    }),
  ])

  const inCount = baseCount - outCount - lowCount
  const filteredCount =
    status === "out" ? outCount : status === "low" ? lowCount : status === "in" ? inCount : baseCount
  const totalPages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE))
  const page = Math.min(requestedPage, totalPages)

  const variants = await prisma.productVariant.findMany({
    where,
    orderBy,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      sku: true,
      stock: true,
      price: true,
      sizeValue: true,
      color: { select: { name: true, hexCode: true } },
      product: {
        select: {
          name: true,
          basePrice: true,
          salePrice: true,
          brand: { select: { name: true } },
          category: { select: { name: true } },
          subcategory: { select: { name: true } },
        },
      },
    },
  })

  const rows: InventoryRow[] = variants.map((v) => ({
    id: v.id,
    sku: v.sku,
    productName: v.product.name,
    brand: v.product.brand.name,
    category: v.product.category.name,
    subcategory: v.product.subcategory?.name ?? null,
    colorName: v.color?.name ?? null,
    colorHex: v.color?.hexCode ?? null,
    sizeValue: v.sizeValue,
    price: v.price ?? v.product.salePrice ?? v.product.basePrice,
    stock: v.stock,
  }))

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

  const stats = [
    { label: "Variants", value: baseCount },
    { label: "In stock", value: inCount },
    { label: `Low (≤ ${LOW_STOCK_THRESHOLD})`, value: lowCount },
    { label: "Out of stock", value: outCount },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif">Inventory</h1>
        <Button asChild>
          <Link href="/admin/inventory/history">View Logs</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-semibold">{s.value.toLocaleString("en-NG")}</p>
          </div>
        ))}
      </div>

      <InventoryFilters brands={brands} categories={categories} colors={colors} />

      <InventoryTable rows={rows} lowStockThreshold={LOW_STOCK_THRESHOLD} />

      <div className="flex items-center justify-between text-sm">
        <p className="text-muted-foreground">
          {filteredCount === 0
            ? "No variants match these filters"
            : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filteredCount)} of ${filteredCount.toLocaleString("en-NG")}`}
        </p>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" disabled={page <= 1}>
            <Link
              href={pageHref(page - 1)}
              aria-disabled={page <= 1}
              className={page <= 1 ? "pointer-events-none opacity-50" : ""}
            >
              Previous
            </Link>
          </Button>
          <span className="px-2">
            Page {page} of {totalPages}
          </span>
          <Button asChild variant="outline" size="sm" disabled={page >= totalPages}>
            <Link
              href={pageHref(page + 1)}
              aria-disabled={page >= totalPages}
              className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
            >
              Next
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}