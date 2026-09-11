import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"

export type ShortItem = {
  variantId: string
  name: string
  sku: string
  requested: number
  available: number
}

export class StockShortageError extends Error {
  constructor(public shortItems: ShortItem[]) {
    super("STOCK_SHORTAGE")
  }
}

export async function checkStockAvailability(
  items: { variantId: string; quantity: number }[],
): Promise<{
  shortItems: ShortItem[]
  variantMap: Map<string, { id: string; price: number | null; productId: string; stock: number; sku: string }>
  productMap: Map<string, {
    id: string
    name: string
    basePrice: number
    salePrice: number | null
    categoryId: string
    subcategoryId: string | null
    brandId: string
  }>
}> {
  const variantIds = items.map((item) => item.variantId)
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    select: { id: true, price: true, productId: true, stock: true, sku: true },
  })
  const variantMap = new Map(variants.map((variant) => [variant.id, variant]))
  const productIds = Array.from(new Set(variants.map((variant) => variant.productId)))
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      basePrice: true,
      salePrice: true,
      categoryId: true,
      subcategoryId: true,
      brandId: true,
    },
  })
  const productMap = new Map(products.map((product) => [product.id, product]))
  const shortItems: ShortItem[] = []

  for (const item of items) {
    const variant = variantMap.get(item.variantId)
    const product = variant ? productMap.get(variant.productId) : undefined
    if (!variant) {
      shortItems.push({ variantId: item.variantId, name: "Item", sku: "", requested: item.quantity, available: 0 })
    } else if (item.quantity > variant.stock) {
      shortItems.push({
        variantId: item.variantId,
        name: product?.name ?? variant.sku,
        sku: variant.sku,
        requested: item.quantity,
        available: variant.stock,
      })
    }
  }

  return { shortItems, variantMap, productMap }
}

export async function decrementStockOrThrow(
  tx: Prisma.TransactionClient,
  items: { variantId: string; quantity: number }[],
): Promise<void> {
  for (const item of items) {
    const decremented = await tx.productVariant.updateMany({
      where: { id: item.variantId, stock: { gte: item.quantity } },
      data: { stock: { decrement: item.quantity } },
    })
    if (decremented.count !== 1) {
      const fresh = await tx.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: { select: { name: true } } },
      })
      throw new StockShortageError([{
        variantId: item.variantId,
        name: fresh?.product.name ?? fresh?.sku ?? "Item",
        sku: fresh?.sku ?? "",
        requested: item.quantity,
        available: fresh?.stock ?? 0,
      }])
    }
  }
}