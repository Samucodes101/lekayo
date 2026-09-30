"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import ProductDetailView, { AddedItemSummary } from "./ProductDetailView"
import { AddedToCartContent } from "./AddedToCartDialog"

export default function ProductModal({ product }: { product: any }) {
  const router = useRouter()
  const [open, setOpen] = useState(true)
  const [step, setStep] = useState<"product" | "added">("product")
  const [addedItem, setAddedItem] = useState<AddedItemSummary | null>(null)

  const close = () => {
    setOpen(false)
    router.back()
  }

  const go = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  const handleAdded = (summary: AddedItemSummary) => {
    setAddedItem(summary)
    setStep("added")
  }

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(o) => {
        if (!o) close()
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed z-50 w-full border bg-background shadow-lg duration-200 focus:outline-none",
            "left-0 right-0 bottom-0 top-auto rounded-t-2xl",
            "sm:left-[50%] sm:right-auto sm:top-[50%] sm:bottom-auto sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            step === "product" ? "flex h-[92dvh] max-h-[92dvh] flex-col overflow-hidden sm:max-w-5xl" : "max-h-[92dvh] overflow-y-auto sm:max-w-md",
          )}
        >
          <DialogPrimitive.Title className="sr-only">
            {step === "product" ? product.name : "Added to Cart"}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {step === "product" ? "Product details" : "Your item has been added to your cart"}
          </DialogPrimitive.Description>

          <DialogPrimitive.Close className="absolute right-4 top-4 z-10 rounded-sm p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>

          {step === "product" ? (
            <ProductDetailView product={product} onAdded={handleAdded} stickyCta />
          ) : (
            <div className="p-6">
              <AddedToCartContent
                item={addedItem}
                onViewCart={() => go("/cart")}
                onCheckout={() => go("/checkout")}
                onContinueShopping={close}
              />
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
