"use client"

import Image from "next/image"
import { CartItem as CartItemType } from "@/stores/cartStore"
import { useActiveCart } from "@/hooks/useActiveCart"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import QuantitySelector from "./QuantitySelector"
import { formatPrice } from "@/lib/utils"

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useActiveCart()

  return (
    <div className="flex gap-4">
      <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
        <Image src={item.image} alt={item.name} width={80} height={80} className="object-cover" />
      </div>
      <div className="flex-1">
        <h4 className="font-medium">{item.name}</h4>
        <p className="text-sm text-gray-500">
          {item.color && `${item.color.name}, `}{item.size && `${item.size}, `}SKU: {item.sku}
        </p>
        <div className="flex items-center justify-between mt-2">
          <QuantitySelector
            quantity={item.quantity}
            max={item.stock ?? 999}
            onQuantityChange={(qty) => updateQuantity(item.variantId, qty)}
          />
          <div className="text-right">
            {item.originalPrice > item.price && (
              <span className="text-xs text-gray-400 line-through">{formatPrice(item.originalPrice)}</span>
            )}
            <span className="font-semibold ml-1">{formatPrice(item.price * item.quantity)}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => removeItem(item.variantId)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        {item.stock !== undefined && item.stock <= 5 && (
          <p className="text-xs text-amber-600 font-medium mt-1">Only {item.stock} left in stock</p>
        )}
      </div>
    </div>
  )
}