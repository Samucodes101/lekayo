"use client"

import { useState } from "react"
import ProductDetailView, { AddedItemSummary } from "./ProductDetailView"
import AddedToCartDialog from "./AddedToCartDialog"
import ProductGrid from "./ProductGrid"

interface ProductDetailClientProps {
  product: any
  related: any[]
}

export default function ProductDetailClient({ product, related }: ProductDetailClientProps) {
  const [addedItem, setAddedItem] = useState<AddedItemSummary | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <div>
      <ProductDetailView
        product={product}
        onAdded={(summary) => {
          setAddedItem(summary)
          setConfirmOpen(true)
        }}
      />

      <div className="mt-16">
        <h2 className="mb-6 text-2xl font-serif">You May Also Like</h2>
        <ProductGrid products={related} />
      </div>

      <AddedToCartDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        item={addedItem}
        onContinueShopping={() => setConfirmOpen(false)}
      />
    </div>
  )
}
