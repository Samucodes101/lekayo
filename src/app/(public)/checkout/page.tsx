"use client"

import { useState, useEffect } from "react"
import { useCartStore } from "@/stores/cartStore"
import CheckoutForm from "@/components/forms/CheckoutForm"
import OrderSummary from "@/components/shared/OrderSummary"

export default function CheckoutPage() {
  const { items, getSubtotal, getTotal } = useCartStore()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setIsReady(true)
  }, [])

  if (items.length === 0) {
    return <div className="container mx-auto px-4 py-16 text-center">Your cart is empty.</div>
  }

  if (!isReady) return <div className="container mx-auto px-4 py-16">Loading payment gateway...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif mb-6">Checkout</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <CheckoutForm />
        <div>
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <OrderSummary subtotal={getSubtotal()} discount={0} shipping={0} total={getTotal()} />
        </div>
      </div>
    </div>
  )
}