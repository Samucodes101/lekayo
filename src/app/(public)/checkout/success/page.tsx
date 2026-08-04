"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/stores/cartStore"
import { useGuestCartStore } from "@/stores/guestCartStore"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const reference = searchParams.get("reference")
  const clearCart = useCartStore((state) => state.clearCart)
  const clearGuestCart = useGuestCartStore((s) => s.clear)

  useEffect(() => {
    if (reference) {
      // Optionally verify payment again
      // Clear both auth and guest stores to ensure client state is reset
      useCartStore.getState().clearCart()
      useGuestCartStore.getState().clear()
    }
  }, [reference, clearCart, clearGuestCart])

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-serif mb-4">Order Successful!</h1>
      <p className="mb-6">Thank you for your purchase. Your order has been received.</p>
      <Button asChild><Link href="/account/orders">View My Orders</Link></Button>
    </div>
  )
}