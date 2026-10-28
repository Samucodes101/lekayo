import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import type { FlashSaleCriteria } from "@/lib/flashSale"

// Flash sales are percentage-only: every discount is `discountValue`% off the naira price.
type PercentDiscount = { discountType: "PERCENTAGE"; discountValue: number }

type FlashSalePayload = {
  name: string
  slug: string
  description?: string
  startsAt: string
  endsAt: string
  active: boolean
  allProductsDiscount?: PercentDiscount | null
  products?: Array<PercentDiscount & { productId: string }>
  categoryDiscounts?: Array<PercentDiscount & { categoryId: string }>
  subcategoryDiscounts?: Array<PercentDiscount & { subcategoryId: string }>
  brandDiscounts?: Array<PercentDiscount & { brandId: string }>
}

const MANAGER_ROLES = ["SUPER_ADMIN", "ADMIN", "MARKETING_MANAGER"]

async function requireManager() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!MANAGER_ROLES.includes(session.user.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  return null
}

const isValidPercent = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0 && value <= 100

/** Keeps only valid percentage entries, normalising the shape stored in criteria. */
function cleanPercentEntries<T extends { discountValue: number }>(entries: T[] | undefined, idKey: keyof T) {
  return (entries ?? [])
    .filter((entry) => entry[idKey] && isValidPercent(entry.discountValue))
    .map((entry) => ({ ...entry, discountType: "PERCENTAGE" as const }))
}

function buildCriteria(data: FlashSalePayload): FlashSaleCriteria {
  return {
    allProductsDiscount:
      data.allProductsDiscount && isValidPercent(data.allProductsDiscount.discountValue)
        ? { discountType: "PERCENTAGE", discountValue: data.allProductsDiscount.discountValue }
        : null,
    categoryDiscounts: cleanPercentEntries(data.categoryDiscounts, "categoryId"),
    subcategoryDiscounts: cleanPercentEntries(data.subcategoryDiscounts, "subcategoryId"),
    brandDiscounts: cleanPercentEntries(data.brandDiscounts, "brandId"),
  }
}

// Only explicit product discounts are stored as rows. Category / subcategory /
// brand / all-product discounts stay in `criteria` and are resolved at read time
// (see resolveDiscount), so they also cover products added after the sale was saved.
function buildFlashSaleProducts(data: FlashSalePayload) {
  const byProduct = new Map<string, { productId: string; discountPercent: number; discountPrice: null }>()
  for (const item of cleanPercentEntries(data.products, "productId")) {
    byProduct.set(item.productId, { productId: item.productId, discountPercent: item.discountValue, discountPrice: null })
  }
  return Array.from(byProduct.values())
}

export async function GET() {
  const denied = await requireManager()
  if (denied) return denied

  const sales = await prisma.flashSale.findMany({
    include: {
      products: {
        include: { product: { select: { categoryId: true, subcategoryId: true, brandId: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // Product-level discounts come from FlashSaleProduct rows; everything else
  // lives in criteria. Older sales also stored a row for every product their
  // category / brand / all-products rule covered — hide those duplicates so
  // the edit form only shows discounts that were set on individual products.
  return NextResponse.json(
    sales.map(({ products, ...sale }) => {
      const criteria = (sale.criteria ?? {}) as FlashSaleCriteria
      const coveredByCriteria = (row: (typeof products)[number]) => {
        const pct = row.discountPercent
        if (pct == null) return false
        const { categoryId, subcategoryId, brandId } = row.product
        return (
          criteria.allProductsDiscount?.discountValue === pct ||
          criteria.categoryDiscounts?.some((d) => d.categoryId === categoryId && d.discountValue === pct) ||
          criteria.subcategoryDiscounts?.some((d) => d.subcategoryId === subcategoryId && d.discountValue === pct) ||
          criteria.brandDiscounts?.some((d) => d.brandId === brandId && d.discountValue === pct) ||
          false
        )
      }

      return {
        ...sale,
        criteria,
        products: products
          .filter((row) => row.discountPercent != null && !coveredByCriteria(row))
          .map((row) => ({
            productId: row.productId,
            discountType: "PERCENTAGE" as const,
            discountValue: row.discountPercent!,
          })),
      }
    }),
  )
}

export async function POST(req: NextRequest) {
  const denied = await requireManager()
  if (denied) return denied

  const data = (await req.json()) as FlashSalePayload

  const sale = await prisma.flashSale.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      active: data.active,
      criteria: buildCriteria(data),
      startsAt: new Date(data.startsAt),
      endsAt: new Date(data.endsAt),
      products: { create: buildFlashSaleProducts(data) },
    },
    include: { products: true },
  })
  return NextResponse.json(sale)
}

export async function PUT(req: NextRequest) {
  const denied = await requireManager()
  if (denied) return denied

  const { id, ...data } = (await req.json()) as FlashSalePayload & { id: string }
  if (!id) return NextResponse.json({ error: "Flash sale ID is required" }, { status: 400 })

  const sale = await prisma.$transaction(async (tx) => {
    await tx.flashSaleProduct.deleteMany({ where: { flashSaleId: id } })
    return tx.flashSale.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        active: data.active,
        criteria: buildCriteria(data),
        startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
        endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
        products: { create: buildFlashSaleProducts(data) },
      },
      include: { products: true },
    })
  })
  return NextResponse.json(sale)
}

// PATCH toggles a sale on/off without touching its discounts
export async function PATCH(req: NextRequest) {
  const denied = await requireManager()
  if (denied) return denied

  const { id, active } = (await req.json()) as { id?: string; active?: boolean }
  if (!id || typeof active !== "boolean") {
    return NextResponse.json({ error: "id and active are required" }, { status: 400 })
  }
  const sale = await prisma.flashSale.update({ where: { id }, data: { active } })
  return NextResponse.json(sale)
}

export async function DELETE(req: NextRequest) {
  const denied = await requireManager()
  if (denied) return denied

  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Flash sale ID is required" }, { status: 400 })

  // FlashSaleProduct rows cascade-delete with the sale
  await prisma.flashSale.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
