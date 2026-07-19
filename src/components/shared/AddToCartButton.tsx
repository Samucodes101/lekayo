"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/stores/cartStore"
import { toast } from "@/hooks/use-toast"
import { ShoppingBag } from "lucide-react"

interface AddToCartButtonProps {
  variantId: string
  quantity: number
  productName: string
  price: number
  image: string
  sku: string
  productId: string
  color?: { name: string; hex: string }
  size?: string
}

export default function AddToCartButton({
  variantId,
  quantity,
  productName,
  price,
  image,
  sku,
  productId,
  color,
  size,
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem)
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    setLoading(true)
    try {
      addItem({
        variantId,
        productId,
        name: productName,
        sku,
        price,
        quantity,
        image,
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
    <Button onClick={handleAdd} disabled={loading} className="w-full">
      <ShoppingBag className="mr-2 h-4 w-4" />
      {loading ? "Adding..." : "Add to Cart"}
    </Button>
  )
}