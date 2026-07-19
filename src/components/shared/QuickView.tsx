"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import Image from "next/image"
import { formatPrice } from "@/lib/utils"
import AddToCartButton from "./AddToCartButton"
import { Button } from "@/components/ui/button"
interface QuickViewProps {
  product: any
  children: React.ReactNode
}

export default function QuickView({ product, children }: QuickViewProps) {
  const [open, setOpen] = useState(false)

  const firstVariant = product.variants?.[0]
  const imageUrl = firstVariant?.images?.[0]?.url || "/placeholder.png"
  const price = product.salePrice ?? product.basePrice

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="aspect-square relative">
            <Image src={imageUrl} alt={product.name} fill className="object-cover rounded" />
          </div>
          <div>
            <h2 className="text-2xl font-serif">{product.name}</h2>
            <p className="text-gray-500">{product.brand?.name}</p>
            <div className="mt-2 text-2xl font-bold">{formatPrice(price)}</div>
            <p className="mt-4 text-sm text-gray-600 line-clamp-3">{product.description}</p>
            <div className="mt-6">
              <AddToCartButton
                variantId={firstVariant?.id}
                quantity={1}
                productName={product.name}
                price={price}
                image={imageUrl}
                sku={firstVariant?.sku || product.sku}
                productId={product.id}
              />
            </div>
            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={() => {
                setOpen(false)
                window.location.href = `/products/${product.slug}`
              }}
            >
              View Full Details
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}