import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(price)
}

export function generateSlug(str: string) {
  return str
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Builds a /shop URL from stored category/subcategory slugs. Slugs are
 * normalised so admin-entered values like "Acid/Stone" can't break the route.
 */
export function getShopUrl(categorySlug: string, subcategorySlug?: string) {
  const base = `/shop/${generateSlug(categorySlug)}`
  return subcategorySlug ? `${base}/${generateSlug(subcategorySlug)}` : base
}

export function getProductUrl(slugOrName: string) {
  const safeSlug = generateSlug(slugOrName || '')
  return safeSlug ? `/products/${encodeURIComponent(safeSlug)}` : '/shop'
}

type FlashSaleDiscount = {
  discountPercent?: number | null
  discountPrice?: number | null
  flashSale?: { active: boolean; startsAt: Date | string; endsAt: Date | string } | null
}

/**
 * Returns true when a flash-sale entry is currently active (within its date window).
 */
function isFlashSaleItemActive(item: FlashSaleDiscount): boolean {
  const fs = item.flashSale
  if (!fs || !fs.active) return false
  const now = new Date()
  const start = new Date(fs.startsAt)
  const end = new Date(fs.endsAt)
  return start <= now && end >= now
}

/**
 * Compute the effective display price for a product considering flash sales.
 *
 * Priority (highest first):
 *   1. Flash sale price (if active and within date range)
 *   2. Product's own salePrice
 *   3. Product's basePrice
 */
export function getEffectivePrice(
  product: {
    basePrice: number
    salePrice?: number | null
    flashSaleItems?: FlashSaleDiscount[]
    flashSaleItem?: FlashSaleDiscount | null
  },
): number {
  let bestFlashDiscount: number | null = null

  const items =
    (product as any).flashSaleItems ||
    ((product as any).flashSaleItem ? [(product as any).flashSaleItem] : [])

  for (const item of items) {
    if (!item) continue
    // Only apply discount if the parent flash sale is active and within its date range
    if (!isFlashSaleItemActive(item)) continue

    // discountPrice is a ₦ amount off (same as FIXED category/brand discounts)
    if (item.discountPrice != null) {
      const original = product.salePrice ?? product.basePrice
      bestFlashDiscount = Math.max(0, Math.round((original - item.discountPrice) * 100) / 100)
      break
    }
    if (item.discountPercent != null) {
      const original = product.salePrice ?? product.basePrice
      const discounted = original * (1 - item.discountPercent / 100)
      if (discounted > 0) {
        bestFlashDiscount = Math.round(discounted * 100) / 100
      }
    }
  }

  if (bestFlashDiscount !== null && bestFlashDiscount > 0) {
    return bestFlashDiscount
  }

  return product.salePrice ?? product.basePrice
}

/**
 * Returns whether an active flash sale discount applies to the product.
 */
export function hasFlashSaleDiscount(
  product: {
    salePrice?: number | null
    flashSaleItems?: FlashSaleDiscount[]
    flashSaleItem?: FlashSaleDiscount | null
  },
): boolean {
  const items =
    (product as any).flashSaleItems ||
    ((product as any).flashSaleItem ? [(product as any).flashSaleItem] : [])

  return items.some(
    (item: FlashSaleDiscount | null | undefined) =>
      item &&
      (item.discountPercent != null || item.discountPrice != null) &&
      isFlashSaleItemActive(item),
  )
}
