import { prisma } from "@/lib/db"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** The bare minimum product info needed by the resolver. */
export type ResolvableProduct = {
  id: string
  basePrice: number
  salePrice?: number | null
  categoryId?: string | null
  subcategoryId?: string | null
  brandId?: string | null
}

/** An optional variant — when present its explicit price overrides the product price. */
export type ResolvableVariant = {
  id: string
  price?: number | null
}

/**
 * A single discount entry on the `criteria` JSON field (category / subcategory /
 * brand / all-products).  Percentage values are integers (e.g. 20 = 20 %).
 */
export type CriteriaDiscountEntry = {
  discountType: "PERCENTAGE" | "FIXED"
  discountValue: number
}

/**
 * Shape of the JSON stored in `FlashSale.criteria`.
 * `products` is NOT here — product-level discounts are stored in the
 * `FlashSaleProduct` relational table.
 */
export type FlashSaleCriteria = {
  allProductsDiscount?: CriteriaDiscountEntry | null
  categoryDiscounts?: (CriteriaDiscountEntry & { categoryId: string })[] | null
  subcategoryDiscounts?: (CriteriaDiscountEntry & { subcategoryId: string })[] | null
  brandDiscounts?: (CriteriaDiscountEntry & { brandId: string })[] | null
}

/**
 * A flash-sale row as consumed by the resolver.
 * The caller should filter to only *active* sales before passing them in.
 */
export type ActiveFlashSale = {
  id: string
  name: string
  criteria: FlashSaleCriteria | null
  /** Product-level discounts (FlashSaleProduct rows). */
  products: {
    productId: string
    discountPercent: number | null
    discountPrice: number | null
  }[]
}

/**
 * Result returned by `resolveDiscount`.
 * `null` means no flash-sale applies.
 */
export type FlashSaleResolution = {
  /** The final (already-computed) price after applying the best discount. */
  discountedPrice: number
  /** Human-readable label, e.g. "Black Friday – 20% off". */
  label: string
  /** The flash sale id that produced this discount. */
  flashSaleId: string
} | null

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true when a flash-sale is currently active. */
export function isFlashSaleActive(sale: { active: boolean; startsAt: Date | string; endsAt: Date | string }) {
  if (!sale.active) return false
  const now = new Date()
  const start = new Date(sale.startsAt)
  const end = new Date(sale.endsAt)
  return start <= now && end >= now
}

/**
 * Derive the base price used to calculate percentage-based discounts.
 * Order of preference: variant.price → product.salePrice → product.basePrice.
 */
function getBasePrice(product: ResolvableProduct, variant?: ResolvableVariant | null): number {
  if (variant?.price != null && variant.price > 0) return variant.price
  return product.salePrice ?? product.basePrice
}

/** Compute the discounted price for a single discount entry. */
function applyDiscount(
  base: number,
  entry: CriteriaDiscountEntry | { discountPercent?: number | null; discountPrice?: number | null },
): number {
  if ("discountType" in entry) {
    if (entry.discountType === "PERCENTAGE") return base * (1 - entry.discountValue / 100)
    return Math.max(0, base - entry.discountValue)
  }
  // FlashSaleProduct-style entry
  if (entry.discountPrice != null) return Math.max(0, entry.discountPrice)
  if (entry.discountPercent != null) return base * (1 - entry.discountPercent / 100)
  return base
}

/**
 * Specificity ordinal – higher = more specific.
 *   4 = product
 *   3 = subcategory
 *   2 = category
 *   1 = brand
 *   0 = all-products
 */
function specificity(d: { level: FlashSaleResolutionLevel }): number {
  const map: Record<FlashSaleResolutionLevel, number> = { product: 4, subcategory: 3, category: 2, brand: 1, all: 0 }
  return map[d.level]
}

type FlashSaleResolutionLevel = "product" | "subcategory" | "category" | "brand" | "all"

// ---------------------------------------------------------------------------
// Main resolver
// ---------------------------------------------------------------------------

/**
 * Find the single best discount applicable to `product` (and optional `variant`)
 * from the provided list of active flash sales.
 *
 * Rules:
 * - Discounts do NOT stack — only the most-specific match wins.
 * - If multiple flash sales provide the same specificity, the one yielding the
 *   lowest price wins.
 * - Percentage discounts are computed against the effective base price
 *   (variant.price → product.salePrice → product.basePrice).
 * - Returns `null` when no active flash sale applies to this product.
 *
 * @example
 * ```ts
 * import { resolveDiscount } from "@/lib/flashSale"
 *
 * // Inside a server component or API route:
 * const sales = await prisma.flashSale.findMany({ ... })
 * const active = sales.filter(isFlashSaleActive)
 * const result = resolveDiscount(product, variant, active)
 * if (result) {
 *   displayPrice = result.discountedPrice
 *   flashSaleBadge = result.label
 * }
 * ```
 */
export function resolveDiscount(
  product: ResolvableProduct,
  variant: ResolvableVariant | null | undefined,
  activeFlashSales: ActiveFlashSale[],
): FlashSaleResolution {
  if (!activeFlashSales.length) return null

  const base = getBasePrice(product, variant)

  let best: {
    discountedPrice: number
    label: string
    flashSaleId: string
    level: FlashSaleResolutionLevel
  } | null = null

  for (const sale of activeFlashSales) {
    const criteria = sale.criteria ?? ({} as FlashSaleCriteria)

    // 1. Product-specific (highest priority)
    const productEntry = sale.products?.find((p) => p.productId === product.id)
    if (productEntry && (productEntry.discountPercent != null || productEntry.discountPrice != null)) {
      const discounted = applyDiscount(base, productEntry)
      if (best === null || specificity({ level: "product" }) > specificity(best) || discounted < best.discountedPrice) {
        const label =
          productEntry.discountPercent != null
            ? `${sale.name} – ${productEntry.discountPercent}% off`
            : `${sale.name} – ₦${productEntry.discountPrice?.toLocaleString()} off`
        best = { discountedPrice: discounted, label, flashSaleId: sale.id, level: "product" }
      }
      // If we already have product-level from another sale, check if this one
      // is cheaper.  Since product-level is the highest specificity, once we
      // find one we only need to compare other product-level entries.
      if (best && best.level === "product") continue
    }

    // If we already found a product-level discount, skip lower-priority checks
    // for this sale (but keep scanning other sales for better product matches).
    if (productEntry && best?.level === "product") continue

    // 2. Subcategory
    if (product.subcategoryId && criteria.subcategoryDiscounts?.length) {
      const sub = criteria.subcategoryDiscounts.find((s) => s.subcategoryId === product.subcategoryId)
      if (sub) {
        const discounted = applyDiscount(base, sub)
        if (best === null || specificity({ level: "subcategory" }) > specificity(best) || discounted < best.discountedPrice) {
          const label =
            sub.discountType === "PERCENTAGE" ? `${sale.name} – ${sub.discountValue}% off` : `${sale.name} – ₦${sub.discountValue.toLocaleString()} off`
          best = { discountedPrice: discounted, label, flashSaleId: sale.id, level: "subcategory" }
        }
      }
    }

    // 3. Category
    if (product.categoryId && criteria.categoryDiscounts?.length) {
      const cat = criteria.categoryDiscounts.find((c) => c.categoryId === product.categoryId)
      if (cat) {
        const discounted = applyDiscount(base, cat)
        if (best === null || specificity({ level: "category" }) > specificity(best) || discounted < best.discountedPrice) {
          const label =
            cat.discountType === "PERCENTAGE" ? `${sale.name} – ${cat.discountValue}% off` : `${sale.name} – ₦${cat.discountValue.toLocaleString()} off`
          best = { discountedPrice: discounted, label, flashSaleId: sale.id, level: "category" }
        }
      }
    }

    // 4. Brand
    if (product.brandId && criteria.brandDiscounts?.length) {
      const brand = criteria.brandDiscounts.find((b) => b.brandId === product.brandId)
      if (brand) {
        const discounted = applyDiscount(base, brand)
        if (best === null || specificity({ level: "brand" }) > specificity(best) || discounted < best.discountedPrice) {
          const label =
            brand.discountType === "PERCENTAGE"
              ? `${sale.name} – ${brand.discountValue}% off`
              : `${sale.name} – ₦${brand.discountValue.toLocaleString()} off`
          best = { discountedPrice: discounted, label, flashSaleId: sale.id, level: "brand" }
        }
      }
    }

    // 5. All products
    if (criteria.allProductsDiscount) {
      const discounted = applyDiscount(base, criteria.allProductsDiscount)
      if (best === null || specificity({ level: "all" }) > specificity(best) || discounted < best.discountedPrice) {
        const ap = criteria.allProductsDiscount
        const label =
          ap.discountType === "PERCENTAGE" ? `${sale.name} – ${ap.discountValue}% off` : `${sale.name} – ₦${ap.discountValue.toLocaleString()} off`
        best = { discountedPrice: discounted, label, flashSaleId: sale.id, level: "all" }
      }
    }
  }

  if (!best) return null
  const rounded = Math.round(best.discountedPrice * 100) / 100
  return { discountedPrice: rounded > 0 ? rounded : 0, label: best.label, flashSaleId: best.flashSaleId }
}

// ---------------------------------------------------------------------------
// Convenience wrapper (for getEffectivePrice / hasFlashSaleDiscount parity)
// ---------------------------------------------------------------------------

/**
 * Shorthand — returns the discounted price or the effective base price.
 */
export function getEffectiveFlashPrice(
  product: ResolvableProduct,
  variant: ResolvableVariant | null | undefined,
  activeFlashSales: ActiveFlashSale[],
): number {
  const result = resolveDiscount(product, variant, activeFlashSales)
  return result?.discountedPrice ?? getBasePrice(product, variant)
}

/**
 * Shorthand — returns whether any flash sale applies.
 */
export function hasFlashSale(
  product: ResolvableProduct,
  variant: ResolvableVariant | null | undefined,
  activeFlashSales: ActiveFlashSale[],
): boolean {
  return resolveDiscount(product, variant, activeFlashSales) !== null
}

// ---------------------------------------------------------------------------
// Server-side DB helper — fetch active flash sales and resolve discounts
// ---------------------------------------------------------------------------

/**
 * Maps a Prisma product with flash sale relations to a ResolvableProduct.
 */
function mapToResolvableProduct(product: {
  id: string
  basePrice: number
  salePrice: number | null
  categoryId: string | null
  subcategoryId: string | null
  brandId: string | null
}): ResolvableProduct {
  return {
    id: product.id,
    basePrice: product.basePrice,
    salePrice: product.salePrice,
    categoryId: product.categoryId,
    subcategoryId: product.subcategoryId,
    brandId: product.brandId,
  }
}

/**
 * Fetches all currently active flash sales from the database and returns
 * them in the shape expected by resolveDiscount.
 */
export async function fetchActiveFlashSales(): Promise<ActiveFlashSale[]> {
  const sales = await prisma.flashSale.findMany({
    where: { active: true },
    include: {
      products: {
        select: { productId: true, discountPercent: true, discountPrice: true },
      },
    },
  })

  return sales
    .filter((s) => isFlashSaleActive(s))
    .map((s) => ({
      id: s.id,
      name: s.name,
      criteria: (s.criteria as FlashSaleCriteria) ?? null,
      products: s.products,
    }))
}

/**
 * Resolves the flash-sale price for a checkout item (product + variant).
 *
 * @param product - The product record (must include id, basePrice, salePrice,
 *   categoryId, subcategoryId, brandId).
 * @param variant - Optional variant record with its own price.
 * @returns An object containing the final price, original price, the
 *   flash-sale label (if any), and the flash sale id (if applicable).
 */
/**
 * Enriches an array of Prisma products with _flashSaleResolved.
 * Call this from any server component before passing products to the client.
 *
 * @param products - Products from Prisma (must include at least id, basePrice,
 *   salePrice, categoryId, subcategoryId, brandId, and optionally flashSaleItems).
 * @returns The same products array with `_flashSaleResolved` attached to each.
 */
export async function enrichProductsWithFlashSales<T extends {
  id: string
  basePrice: number
  salePrice: number | null
  categoryId: string | null
  subcategoryId: string | null
  brandId: string | null
}>(products: T[]): Promise<(T & { _flashSaleResolved: { finalPrice: number; originalPrice: number; flashSaleLabel: string | null; flashSaleId: string | null; discountSaved: number } | null })[]> {
  if (!products.length) return products as any

  const activeSales = await fetchActiveFlashSales()
  return products.map((product) => {
    const resolved = resolveCheckoutPrice(product, null, activeSales)
    return {
      ...product,
      _flashSaleResolved: resolved.finalPrice < resolved.originalPrice ? resolved : null,
    } as any
  })
}

export function resolveCheckoutPrice(
  product: {
    id: string
    basePrice: number
    salePrice: number | null
    categoryId: string | null
    subcategoryId: string | null
    brandId: string | null
  },
  variant: { id: string; price: number | null } | null | undefined,
  activeFlashSales: ActiveFlashSale[],
): {
  finalPrice: number
  originalPrice: number
  flashSaleLabel: string | null
  flashSaleId: string | null
  discountSaved: number
} {
  const base = getBasePrice(mapToResolvableProduct(product), variant ? { id: variant.id, price: variant.price } : null)
  const resolution = resolveDiscount(
    mapToResolvableProduct(product),
    variant ? { id: variant.id, price: variant.price } : null,
    activeFlashSales,
  )

  return {
    finalPrice: resolution?.discountedPrice ?? base,
    originalPrice: base,
    flashSaleLabel: resolution?.label ?? null,
    flashSaleId: resolution?.flashSaleId ?? null,
    discountSaved: resolution ? Math.round((base - resolution.discountedPrice) * 100) / 100 : 0,
  }
}

