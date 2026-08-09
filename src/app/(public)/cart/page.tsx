"use client"

import { useActiveCart } from "@/hooks/useActiveCart"
import CartItem from "@/components/shared/CartItem"
import OrderSummary from "@/components/shared/OrderSummary"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CartPage() {
  const { items, getSubtotal, getTotal, isHydrated } = useActiveCart()

  // Calculate flash sale discount
  const subtotal = getSubtotal()
  const discount = items.reduce((sum, item) => {
    if (item.originalPrice > item.price) {
      return sum + (item.originalPrice - item.price) * item.quantity
    }
    return sum
  }, 0)
  const total = subtotal

  if (!isHydrated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Loading cart…</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-serif mb-4">Your cart is empty</h1>
        <Button asChild><Link href="/shop">Continue Shopping</Link></Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif mb-6">Shopping Cart</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => (
            <CartItem key={item.variantId} item={item} />
          ))}
        </div>
        <div>
          <OrderSummary subtotal={subtotal} discount={discount} shipping={0} total={Math.max(0, total - discount)} />
          <Button asChild className="w-full mt-4">
            <Link href="/checkout">Proceed to Checkout</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
