"use client"

import Image from "next/image"
import Link from "next/link"
import { ProductWithVariants } from "@/types"
import { formatPrice, getEffectivePrice, hasFlashSaleDiscount } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useWishlistStore } from "@/stores/wishlistStore"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import QuickView from "./QuickView"

interface ProductCardProps {
  product: ProductWithVariants & {
    brand?: { name: string } | null
    _flashSaleResolved?: { finalPrice: number; originalPrice: number; flashSaleLabel: string; discountSaved: number } | null
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, removeItem, isInWishlist } = useWishlistStore()
  const inWishlist = isInWishlist(product.id)

  const toggleWishlist = () => {
    if (inWishlist) {
      removeItem(product.id)
      toast({ title: "Removed from wishlist" })
    } else {
      const sortedVariants = [...(product.variants || [])].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
      const firstVariant = sortedVariants[0]
      const imageUrl = firstVariant?.images?.[0]?.url || "/placeholder.png"
      const price = product.salePrice ?? product.basePrice
      addItem({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: price,
        image: imageUrl,
      })
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
  const originalPrice = resolvedFlash?.originalPrice ?? product.salePrice ?? product.basePrice
  const isOnFlashSale = resolvedFlash ? resolvedFlash.discountSaved > 0 : hasFlashSaleDiscount(product)
  const discountPercent = resolvedFlash?.discountSaved
    ? Math.round((resolvedFlash.discountSaved / resolvedFlash.originalPrice) * 100)
    : (isOnFlashSale && displayPrice < originalPrice ? Math.round((1 - displayPrice / originalPrice) * 100) : 0)

  return (
    <div className="group relative">
      <QuickView product={product}>
        <div className="cursor-pointer">
          <div className="aspect-square overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={product.name}
            width={500}
            height={500}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.png"
            }}
          />
          </div>
        </div>
      </QuickView>
      <Link href={`/products/${product.slug}`}>
        <div className="mt-4">
          <h3 className="text-sm font-medium line-clamp-2">{product.name}</h3>
          <p className="text-sm text-gray-500">{product.brand?.name || "Unknown Brand"}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="font-semibold">{formatPrice(displayPrice)}</span>
            {isOnFlashSale && displayPrice < originalPrice ? (
              <span className="text-sm text-red-500">
                <span className="line-through text-gray-400 mr-1">{formatPrice(originalPrice)}</span>
                {discountPercent}% OFF
              </span>
            ) : product.salePrice && product.salePrice < product.basePrice ? (
              <span className="text-sm text-gray-400 line-through">{formatPrice(product.basePrice)}</span>
            ) : null}
          </div>
        </div>
      </Link>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 bg-white/80 rounded-full hover:bg-white/90"
        onClick={toggleWishlist}
      >
        <Heart className={cn("h-5 w-5", inWishlist && "fill-red-500 text-red-500")} />
      </Button>
    </div>
  )
}
