"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { formatPrice } from "@/lib/utils"

type Variant = {
  id: string
  sku: string
  price: number | null
  stock: number
  product: { name: string; basePrice: number; salePrice: number | null }
}

type Customer = {
  id: string
  name: string | null
  email: string | null
  phone: string | null
}

type LineItem = { variant: Variant; quantity: number }

export default function NewCSOrderPage() {
  const router = useRouter()
  const [productQuery, setProductQuery] = useState("")
  const [productResults, setProductResults] = useState<Variant[]>([])
  const [items, setItems] = useState<LineItem[]>([])
  const [customerQuery, setCustomerQuery] = useState("")
  const [customerResults, setCustomerResults] = useState<Customer[]>([])
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("Cash")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  async function searchProducts() {
    if (productQuery.trim().length < 2) return
    const response = await fetch(`/api/inventory/search?q=${encodeURIComponent(productQuery.trim())}`)
    setProductResults(await response.json())
  }

  async function searchCustomers() {
    if (customerQuery.trim().length < 2) return
    const response = await fetch(`/api/customers/search?q=${encodeURIComponent(customerQuery.trim())}`)
    setCustomerResults(await response.json())
  }

  function addItem(variant: Variant) {
    setItems((current) => {
      const existing = current.find((item) => item.variant.id === variant.id)
      if (existing) {
        return current.map((item) => item.variant.id === variant.id
          ? { ...item, quantity: Math.min(item.quantity + 1, variant.stock) }
          : item)
      }
      return [...current, { variant, quantity: 1 }]
    })
  }

  async function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    if (!customer && (!name.trim() || !phone.trim())) {
      setError("Select a customer or enter a name and phone number.")
      return
    }
    if (items.length === 0) {
      setError("Add at least one item.")
      return
    }
    setSaving(true)
    try {
      const response = await fetch("/api/cs/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer?.id,
          name,
          phone,
          email,
          paymentMethod,
          items: items.map((item) => ({ variantId: item.variant.id, quantity: item.quantity })),
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        const shortage = data.shortItems?.map((item: { name: string; available: number }) => `${item.name}: ${item.available} left`).join(", ")
        throw new Error(shortage || data.error || "Unable to create order")
      }
      router.push(`/cs/orders/${data.orderId}/print`)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create order")
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submitOrder} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif">New Walk-in Order</h1>
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Create and print receipt"}</Button>
      </div>
      {error && <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Products</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={productQuery} onChange={(event) => setProductQuery(event.target.value)} placeholder="Search product or SKU" />
              <Button type="button" onClick={searchProducts}>Search</Button>
            </div>
            <div className="space-y-2">
              {productResults.map((variant) => (
                <button type="button" key={variant.id} onClick={() => addItem(variant)} className="flex w-full justify-between border p-3 text-left hover:bg-gray-50">
                  <span>{variant.product.name} <span className="text-sm text-gray-500">({variant.sku})</span></span>
                  <span>{formatPrice(variant.price ?? variant.product.salePrice ?? variant.product.basePrice)} · {variant.stock} left</span>
                </button>
              ))}
            </div>
            {items.map((item) => (
              <div key={item.variant.id} className="flex items-center justify-between border-t pt-3">
                <span>{item.variant.product.name} ({item.variant.sku})</span>
                <Input className="w-20" type="number" min={1} max={item.variant.stock} value={item.quantity} onChange={(event) => setItems((current) => current.map((line) => line.variant.id === item.variant.id ? { ...line, quantity: Number(event.target.value) } : line))} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Customer and payment</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={customerQuery} onChange={(event) => setCustomerQuery(event.target.value)} placeholder="Find by name, email, or phone" />
              <Button type="button" onClick={searchCustomers}>Find</Button>
            </div>
            {customerResults.map((result) => (
              <button type="button" key={result.id} onClick={() => { setCustomer(result); setCustomerResults([]) }} className="block w-full border p-2 text-left hover:bg-gray-50">
                {result.name || "Unnamed"} · {result.email || result.phone || "No contact"}
              </button>
            ))}
            {customer ? (
              <p className="rounded bg-gray-50 p-3 text-sm">Selected: {customer.name || "Unnamed"} · {customer.email || customer.phone || "No contact"}</p>
            ) : (
              <div className="space-y-3">
                <Input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Customer name" />
                <Input required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone number" />
                <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email (optional)" />
              </div>
            )}
            <select className="w-full rounded-md border p-2" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
              <option>Cash</option>
              <option>POS/Card</option>
              <option>Bank Transfer</option>
            </select>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}
