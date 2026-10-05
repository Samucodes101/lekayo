"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import type { AddedItemSummary } from "./ProductDetailView"
import { Check } from "lucide-react"

const PLACEHOLDER_SRC = "/placeholder.png"

function ItemThumbnail({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)

  return (
    <Image
      // Re-mount when the source changes so a previous failure doesn't stick
      key={src}
      src={failed ? PLACEHOLDER_SRC : src}
      alt={alt}
      width={64}
      height={64}
      sizes="64px"
      className="h-full w-full object-cover"
      onError={() => {
        // Only flip once, so a broken placeholder can't cause a loop
        if (!failed) setFailed(true)
      }}
    />
  )
}

export function AddedToCartContent({
  item,
  onViewCart,
  onCheckout,
  onContinueShopping,
}: {
  item: AddedItemSummary | null
  onViewCart: () => void
  onCheckout: () => void
  onContinueShopping: () => void
}) {
  if (!item) return null

  return (
    <div className="flex w-full min-w-0 flex-col items-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
        <Check className="h-6 w-6 text-green-600" />
      </div>
      <h2 className="mt-4 text-xl font-serif">Added to Cart</h2>

      <div className="mt-4 flex w-full min-w-0 items-center gap-3 rounded-lg border p-3 text-left">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100">
          <ItemThumbnail src={item.image} alt={item.name} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 break-words font-medium">{item.name}</p>
          {item.color && (
            <p className="truncate text-xs text-gray-500">
              {item.color.name}
              {item.size ? ` / ${item.size}` : ""}
            </p>
          )}
          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
        </div>
        <div className="shrink-0 whitespace-nowrap text-right">
          {item.originalPrice && item.originalPrice > item.price && (
            <span className="block text-xs text-gray-400 line-through">
              {formatPrice(item.originalPrice)}
            </span>
          )}
          <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
        </div>
      </div>

      <div className="mt-5 flex w-full flex-col gap-2">
        <Button onClick={onViewCart} className="w-full">
          View Cart
        </Button>
        <Button onClick={onCheckout} variant="outline" className="w-full">
          Checkout
        </Button>
        <button
          type="button"
          onClick={onContinueShopping}
          className="mt-1 text-sm text-gray-600 underline underline-offset-4 hover:text-gray-900"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  )
}

export default function AddedToCartDialog({
  open,
  onOpenChange,
  item,
  onContinueShopping,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: AddedItemSummary | null
  onContinueShopping: () => void
}) {
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="left-0 right-0 bottom-0 top-auto max-w-none translate-x-0 translate-y-0 overflow-hidden rounded-t-2xl p-6 sm:left-[50%] sm:right-auto sm:top-[50%] sm:bottom-auto sm:max-w-sm sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg">
        <DialogTitle className="sr-only">Added to Cart</DialogTitle>
        <AddedToCartContent
          item={item}
          onViewCart={() => {
            onOpenChange(false)
            router.push("/cart")
          }}
          onCheckout={() => {
            onOpenChange(false)
            router.push("/checkout")
          }}
          onContinueShopping={onContinueShopping}
        />
      </DialogContent>
    </Dialog>
  )
}