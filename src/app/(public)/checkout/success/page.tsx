"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/stores/cartStore"
import { useGuestCartStore } from "@/stores/guestCartStore"
import { formatPrice } from "@/lib/utils"

type OrderSummary = {
  id: string
  orderNumber: string
  status: string
  subtotal: number
  discount: number
  shippingCost: number
  total: number
  items: { id: string; quantity: number; unitPrice: number; name: string }[]
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const reference = searchParams.get("reference") || searchParams.get("tx_ref") || ""
  const [order, setOrder] = useState<OrderSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    useCartStore.getState().clearCart()
    useGuestCartStore.getState().clear()
  }, [])

  useEffect(()=>{
    if (!reference) {
      setLoading(false)
      return
    }
    fetch(`/api/checkout/order/by-reference?reference=${encodeURIComponent(reference)}`)
      .then((res)=>res.json())
      .then((data)=>{
        if (!data.error) setOrder(data)
      })
      .catch(()=>{})
      .finally(()=>setLoading(false))
  }, [reference])

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
      <h1 className="text-3xl font-serif mb-4">Order Successful!</h1>
      <p className="mb-6 text-muted-foreground">Thank you for your purchase.</p>

      {loading ? (
        <p className="text-muted-foreground">Loading your order...</p>
      ) : order ? (
        <div className="text-left border rounded-lg p-6 space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order</span>
            <span className="font-mono font-medium">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium capitalize">{order.status.toLowerCase()}</span>
          </div>
          <div className="border-t pt-3 space-y-2">
            {order.items.map((item)=>(
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.name} x {item.quantity}</span>
                <span>{formatPrice(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-2 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{formatPrice(order.shippingCost)}</span></div>
            <div className="flex justify-between font-semibold"><span>Total</span><span>{formatPrice(order.total)}</span></div>
          </div>
          <div className="pt-3 flex justify-center gap-3">
            <Button asChild variant="outline"><Link href="/orders/track">Track order</Link></Button>
            <Button asChild><Link href="/shop">Continue shopping</Link></Button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-muted-foreground mb-6">
            We couldn't find details for this payment. Check your email for the receipt.
          </p>
          <Button asChild><Link href="/orders/track">Track your order</Link></Button>
        </>
      )}
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}