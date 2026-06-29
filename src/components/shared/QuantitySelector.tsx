"use client"

import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"

interface QuantitySelectorProps {
  quantity: number
  onQuantityChange: (qty: number) => void
  max?: number
}

export default function QuantitySelector({ quantity, onQuantityChange, max = 999 }: QuantitySelectorProps) {
  const decrease = () => {
    if (quantity > 1) onQuantityChange(quantity - 1)
  }
  const increase = () => {
    if (quantity < max) onQuantityChange(quantity + 1)
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={decrease} disabled={quantity <= 1}>
        <Minus className="h-3 w-3" />
      </Button>
      <span className="w-10 text-center">{quantity}</span>
      <Button variant="outline" size="icon" onClick={increase} disabled={quantity >= max}>
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  )
}