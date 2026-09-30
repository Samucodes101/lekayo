"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { MouseEvent } from "react"
import { ProductWithVariants } from "@/types"
import { formatPrice, getEffectivePrice, hasFlashSaleDiscount, getProductUrl, cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useWishlistStore } from "@/stores/wishlistStore"
import { toast } from "@/hooks/use-toast"

interface ProductCardProps {
  product: ProductWithVariants & {
    brand?: { name: string } | null
    _flashSaleResolved?: { finalPrice: number; originalPrice: number; flashSaleLabel: string; discountSaved: number } | null
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter()
  const { addItem, removeItem, isInWishlist } = useWishlistStore()
  const inWishlist = isInWishlist(product.id)

  const toggleWishlist = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (inWishlist) {
      removeItem(product.id)
      toast({ title: "Removed from wishlist" })
    } else {
      const sortedVariants = [...(product.variants || [])].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
      const firstVariant = sortedVariants[0]
      const imageUrl = firstVariant?.images?.[0]?.url || "/placeholder.png"
      const price = product.salePrice ?? product.basePrice
      addItem({ id: product.id, name: product.name, slug: product.slug, price, image: imageUrl })
      toast({ title: "Added to wishlist" })
    }
  }

  const sortedVariants = [...(product.variants || [])].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
  const firstVariant = sortedVariants[0]
  const imageUrl = firstVariant?.images?.[0]?.url || "/placeholder.png"

  // Prefer server-resolved flash sale price (covers criteria-based discounts),
  // fall back to client-side resolution from FlashSaleProduct rows
  const resolvedFlash = (product as any)._flashSaleResolved
  const displayPrice = resolvedFlash?.finalPrice ?? getEffectivePrice(product)
  const originalPrice = resolvedFlash?.originalPrice ?? product.basePrice
  const isOnFlashSale = resolvedFlash ? resolvedFlash.discountSaved > 0 : hasFlashSaleDiscount(product)
  const discountPercent = resolvedFlash?.discountSaved
    ? Math.round((resolvedFlash.discountSaved / resolvedFlash.originalPrice) * 100)
    : (isOnFlashSale && displayPrice < originalPrice ? Math.round((1 - displayPrice / originalPrice) * 100) : 0)

  const url = getProductUrl(product.slug || product.name)

  return (
    <div className="group relative">
      <Link
        href={url}
        prefetch={false}
        onMouseEnter={() => router.prefetch(url)}
        onFocus={() => router.prefetch(url)}
        className="block"
      >
        <div className="aspect-square overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={product.name}
            width={500}
            height={500}
            sizes="(min-width: 768px) 33vw, 50vw"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.png"
            }}
          />
        </div>
        <div className="mt-4">
          <h3 className="text-sm font-medium line-clamp-2">{product.name}</h3>
          <p className="text-sm text-gray-500">{product.brand?.name || "Unknown Brand"}</p>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="font-semibold text-sm sm:text-base">{formatPrice(displayPrice)}</span>
            {isOnFlashSale && displayPrice < originalPrice ? (
              <span className="inline-flex items-center gap-1 text-xs text-red-600">
                <span className="line-through text-gray-400">{formatPrice(originalPrice)}</span>
                <span className="rounded-sm bg-red-50 px-1 py-0.5 font-medium">-{discountPercent}%</span>
              </span>
            ) : product.salePrice && product.salePrice < product.basePrice ? (
              <span className="text-xs text-gray-400 line-through">{formatPrice(product.basePrice)}</span>
            ) : null}
          </div>
        </div>
      </Link>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full bg-white/90 p-0 shadow-sm hover:bg-white"
        onClick={toggleWishlist}
        aria-label={inWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart className={cn("h-4 w-4", inWishlist && "fill-red-500 text-red-500")} />
      </Button>
    </div>
  )
}
