"use client"

import Image from "next/image"
import Link from "next/link"
import { ProductWithVariants } from "@/types"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useWishlistStore } from "@/stores/wishlistStore"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import QuickView from "./QuickView"
interface ProductCardProps {
  product: ProductWithVariants & { brand?: { name: string } | null }
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, removeItem, isInWishlist } = useWishlistStore()
  const inWishlist = isInWishlist(product.id)

  const toggleWishlist = () => {
    if (inWishlist) {
      removeItem(product.id)
      toast({ title: "Removed from wishlist" })
    } else {
      // Convert product to WishlistItem
      const firstVariant = product.variants?.[0]
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

  const firstVariant = product.variants?.[0]
  const imageUrl = firstVariant?.images?.[0]?.url || "/placeholder.png"
  const price = product.salePrice ?? product.basePrice

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
            <span className="font-semibold">{formatPrice(price)}</span>
            {product.salePrice && (
              <span className="text-sm text-gray-400 line-through">{formatPrice(product.basePrice)}</span>
            )}
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