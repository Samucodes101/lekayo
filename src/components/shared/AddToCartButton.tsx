"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/stores/cartStore"
import { toast } from "@/hooks/use-toast"
import { ShoppingBag } from "lucide-react"

interface AddToCartButtonProps {
  variantId: string
  quantity: number
}

export default function AddToCartButton({ variantId, quantity }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem)
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    setLoading(true)
    try {
      await addItem(variantId, quantity)
      toast({ title: "Added to cart", description: "Item has been added to your cart." })
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