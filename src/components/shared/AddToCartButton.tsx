"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useActiveCart } from "@/hooks/useActiveCart"
import { toast } from "@/hooks/use-toast"
import { ShoppingBag } from "lucide-react"

interface AddToCartButtonProps {
  variantId: string
  quantity: number
  productName: string
  price: number
  originalPrice?: number
  image: string
  sku: string
  productId: string
  stock?: number
  color?: { name: string; hex: string }
  size?: string
}

export default function AddToCartButton({
  variantId,
  quantity,
  productName,
  price,
  originalPrice,
  image,
  sku,
  productId,
  stock,
  color,
  size,
}: AddToCartButtonProps) {
  const { addItem } = useActiveCart()
  const [loading, setLoading] = useState(false)

  const outOfStock = stock !== undefined && stock <= 0

  const handleAdd = async () => {
    if (outOfStock) return

    setLoading(true)
    try {
      addItem({
        variantId,
        productId,
        name: productName,
        sku,
        price,
        originalPrice: originalPrice ?? price,
        quantity,
        image,
        stock,
        color,
        size,
      })
      toast({ title: "Added to cart", description: `${productName} added to your cart.` })
    } catch (error) {
      toast({ title: "Error", description: "Could not add item to cart.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2 w-full">
      <Button onClick={handleAdd} disabled={loading || outOfStock} className="w-full">
        <ShoppingBag className="mr-2 h-4 w-4" />
        {outOfStock ? "Out of Stock" : loading ? "Adding..." : "Add to Cart"}
      </Button>
      {stock !== undefined && stock > 0 && stock <= 5 && (
        <p className="text-xs text-amber-600 font-medium">Only {stock} left in stock</p>
      )}
    </div>
  )
}