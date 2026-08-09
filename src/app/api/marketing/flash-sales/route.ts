import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

type DiscountType = "PERCENTAGE" | "FIXED"

type FlashSalePayload = {
  name: string
  slug: string
  description?: string
  startsAt: string
  endsAt: string
  active: boolean
  allProductsDiscount?: { discountType: DiscountType; discountValue: number }
  products?: Array<{ productId: string; discountType: DiscountType; discountValue: number }>
  categoryDiscounts?: Array<{ categoryId: string; discountType: DiscountType; discountValue: number }>
  subcategoryDiscounts?: Array<{ subcategoryId: string; discountType: DiscountType; discountValue: number }>
  brandDiscounts?: Array<{ brandId: string; discountType: DiscountType; discountValue: number }>
}

type ProductDiscountInput = { productId: string; discountPercent?: number | null; discountPrice?: number | null }

async function buildFlashSaleProducts(data: FlashSalePayload) {
  const productMap = new Map<string, ProductDiscountInput>()

  const setDiscount = (productId: string, discountType: DiscountType, discountValue: number) => {
    if (!productId || discountValue == null) return
    if (discountType === "PERCENTAGE") {
      productMap.set(productId, { productId, discountPercent: discountValue, discountPrice: null })
    } else {
      productMap.set(productId, { productId, discountPercent: null, discountPrice: discountValue })
    }
  }

  if (data.allProductsDiscount) {
    const allProducts = await prisma.product.findMany({ select: { id: true } })
    allProducts.forEach((product) => setDiscount(product.id, data.allProductsDiscount!.discountType, data.allProductsDiscount!.discountValue))
  }

  if (data.brandDiscounts?.length) {
    const brandIds = Array.from(new Set(data.brandDiscounts.map((item) => item.brandId)))
    const brandProducts = await prisma.product.findMany({ where: { brandId: { in: brandIds } }, select: { id: true, brandId: true } })
    brandProducts.forEach((product) => {
      const discount = data.brandDiscounts?.find((item) => item.brandId === product.brandId)
      if (discount) {
        setDiscount(product.id, discount.discountType, discount.discountValue)
      }
    })
  }

  if (data.categoryDiscounts?.length) {
    const categoryIds = Array.from(new Set(data.categoryDiscounts.map((item) => item.categoryId)))
    const categoryProducts = await prisma.product.findMany({ where: { categoryId: { in: categoryIds } }, select: { id: true, categoryId: true } })
    categoryProducts.forEach((product) => {
      const discount = data.categoryDiscounts?.find((item) => item.categoryId === product.categoryId)
      if (discount) {
        setDiscount(product.id, discount.discountType, discount.discountValue)
      }
    })
  }

  if (data.subcategoryDiscounts?.length) {
    const subcategoryIds = Array.from(new Set(data.subcategoryDiscounts.map((item) => item.subcategoryId)))
    const subcategoryProducts = await prisma.product.findMany({ where: { subcategoryId: { in: subcategoryIds } }, select: { id: true, subcategoryId: true } })
    subcategoryProducts.forEach((product) => {
      const discount = data.subcategoryDiscounts?.find((item) => item.subcategoryId === product.subcategoryId)
      if (discount) {
        setDiscount(product.id, discount.discountType, discount.discountValue)
      }
    })
  }

  if (data.products?.length) {
    data.products.forEach((item) => {
      if (item.productId) {
        setDiscount(item.productId, item.discountType, item.discountValue)
      }
    })
  }

  return Array.from(productMap.values()).filter((entry) => entry.discountPercent != null || entry.discountPrice != null)
}

export async function GET() {
  const sales = await prisma.flashSale.findMany({
    include: {
      products: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  // Map the response so the form receives the expected shape.
  // Product-level discounts come from FlashSaleProduct rows (relation);
  // category / subcategory / brand / all-product discounts live in criteria JSON.
  return NextResponse.json(
    sales.map((sale) => ({
      ...sale,
      criteria: sale.criteria ?? {},
      // Synthesise a form-compatible `products` array from FlashSaleProduct rows
      products: sale.products.map((p) => ({
        productId: p.productId,
        discountType: p.discountPercent != null ? ("PERCENTAGE" as const) : ("FIXED" as const),
        discountValue: p.discountPercent ?? p.discountPrice ?? 0,
      })),
    })),
  )
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const data = (await req.json()) as FlashSalePayload
  const { allProductsDiscount, products, categoryDiscounts, subcategoryDiscounts, brandDiscounts, ...saleFields } = data

  const flashSaleProducts = await buildFlashSaleProducts(data)

  const sale = await prisma.flashSale.create({
    data: {
      ...saleFields,
      criteria: {
        allProductsDiscount: data.allProductsDiscount,
        categoryDiscounts: data.categoryDiscounts,
        subcategoryDiscounts: data.subcategoryDiscounts,
        brandDiscounts: data.brandDiscounts,
      },
      startsAt: new Date(data.startsAt),
      endsAt: new Date(data.endsAt),
      products: {
        create: flashSaleProducts,
      },
    },
    include: { products: true },
  })
  return NextResponse.json(sale)
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id, allProductsDiscount, products, categoryDiscounts, subcategoryDiscounts, brandDiscounts, ...data } =
    (await req.json()) as FlashSalePayload & { id: string }
  const flashSaleProducts = await buildFlashSaleProducts({ allProductsDiscount, products, categoryDiscounts, subcategoryDiscounts, brandDiscounts, ...data } as FlashSalePayload)

  await prisma.flashSaleProduct.deleteMany({ where: { flashSaleId: id } })

  const sale = await prisma.flashSale.update({
    where: { id },
    data: {
      ...data,
      criteria: {
        allProductsDiscount: allProductsDiscount,
        categoryDiscounts: categoryDiscounts,
        subcategoryDiscounts: subcategoryDiscounts,
        brandDiscounts: brandDiscounts,
      },
      startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
      endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
      products: {
        create: flashSaleProducts,
      },
    },
    include: { products: true },
  })
  return NextResponse.json(sale)
}