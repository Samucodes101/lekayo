"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/stores/cartStore"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const reference = searchParams.get("reference")
  const clearCart = useCartStore((state) => state.clearCart)

  useEffect(() => {
    if (reference) {
      // Optionally verify payment again
      clearCart()
    }
  }, [reference, clearCart])

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-serif mb-4">Order Successful!</h1>
      <p className="mb-6">Thank you for your purchase. Your order has been received.</p>
      <Button asChild><Link href="/account/orders">View My Orders</Link></Button>
    </div>
  )
}