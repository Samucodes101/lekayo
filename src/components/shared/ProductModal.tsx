"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import ProductDetailView, { AddedItemSummary } from "./ProductDetailView"
import { AddedToCartContent } from "./AddedToCartDialog"

export default function ProductModal({ product }: { product: any }) {
  const router = useRouter()
  const [step, setStep] = useState<"product" | "added">("product")
  const [addedItem, setAddedItem] = useState<AddedItemSummary | null>(null)

  const close = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push("/shop")
    }
  }

  const handleAdded = (summary: AddedItemSummary) => {
    setAddedItem(summary)
    setStep("added")
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      <DialogContent
        className={cn(
          "max-h-[92vh] w-full overflow-hidden p-0",
          "left-0 right-0 bottom-0 top-auto translate-x-0 translate-y-0 rounded-t-2xl",
          "sm:left-[50%] sm:right-auto sm:top-[50%] sm:bottom-auto sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg",
          step === "product" ? "flex max-w-none flex-col gap-0 sm:max-w-5xl" : "max-w-none sm:max-w-md",
        )}
      >
        <DialogTitle className="sr-only">
          {step === "product" ? product.name : "Added to Cart"}
        </DialogTitle>
        {step === "product" ? (
          <ProductDetailView product={product} onAdded={handleAdded} stickyCta />
        ) : (
          <div className="p-6">
            <AddedToCartContent item={addedItem} onContinueShopping={close} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
