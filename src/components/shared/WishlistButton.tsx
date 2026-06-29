"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useWishlistStore } from "@/stores/wishlistStore"
import { Heart } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface WishlistButtonProps {
  productId: string
  size?: "default" | "icon"
}

export default function WishlistButton({ productId, size = "default" }: WishlistButtonProps) {
  const { addItem, removeItem, isInWishlist } = useWishlistStore()
  const inWishlist = isInWishlist(productId)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    try {
      if (inWishlist) {
        removeItem(productId)
        toast({ title: "Removed from wishlist" })
      } else {
        // Need to fetch product details first
        const res = await fetch(`/api/products/${productId}`)
        const product = await res.json()
        addItem(product)
        toast({ title: "Added to wishlist" })
      }
    } catch (error) {
      toast({ title: "Error", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  if (size === "icon") {
    return (
      <Button variant="outline" size="icon" onClick={handleToggle} disabled={loading}>
        <Heart className={`h-5 w-5 ${inWishlist ? "fill-red-500 text-red-500" : ""}`} />
      </Button>
    )
  }

  return (
    <Button variant="outline" onClick={handleToggle} disabled={loading}>
      <Heart className={`mr-2 h-4 w-4 ${inWishlist ? "fill-red-500 text-red-500" : ""}`} />
      {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
    </Button>
  )
}