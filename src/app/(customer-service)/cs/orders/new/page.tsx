"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { formatPrice } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type Variant = {
  id: string
  sku: string
  price: number | null
  stock: number
  sizeValue: string | null
  color: { name: string; hexCode: string } | null
  images: { url: string }[]
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
  const [previewVariant, setPreviewVariant] = useState<Variant | null>(null)
  const [previewQuantity, setPreviewQuantity] = useState(1)
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

  function addItem(variant: Variant, quantity = 1) {
    setItems((current) => {
      const existing = current.find((item) => item.variant.id === variant.id)
      if (existing) {
        return current.map((item) => item.variant.id === variant.id
          ? { ...item, quantity: Math.min(item.quantity + quantity, variant.stock) }
          : item)
      }
      return [...current, { variant, quantity: Math.min(quantity, variant.stock) }]
    })
    setPreviewVariant(null)
    setPreviewQuantity(1)
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
                <button
                  type="button"
                  key={variant.id}
                  onClick={() => { setPreviewVariant(variant); setPreviewQuantity(1) }}
                  className="flex w-full items-center gap-3 border p-3 text-left hover:bg-gray-50"
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded bg-gray-100">
                    {variant.images[0] ? <img src={variant.images[0].url} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-xs text-gray-400">No image</span>}
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{variant.product.name}</span>
                    <span className="block text-sm text-gray-500">SKU: {variant.sku}{variant.sizeValue ? ` · Size ${variant.sizeValue}` : ""}{variant.color ? ` · ${variant.color.name}` : ""}</span>
                  </span>
                  <span className="shrink-0 text-right text-sm">{formatPrice(variant.price ?? variant.product.salePrice ?? variant.product.basePrice)}<br />{variant.stock} left</span>
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

      <Dialog open={previewVariant !== null} onOpenChange={(open) => !open && setPreviewVariant(null)}>
        <DialogContent className="max-w-md">
          {previewVariant && (
            <>
              <DialogHeader>
                <DialogTitle>Preview variant</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="aspect-square overflow-hidden rounded bg-gray-100">
                  {previewVariant.images[0] ? <img src={previewVariant.images[0].url} alt={previewVariant.product.name} className="h-full w-full object-contain" /> : <div className="flex h-full items-center justify-center text-sm text-gray-400">No product image</div>}
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{previewVariant.product.name}</h2>
                  <p className="text-sm text-gray-500">SKU: {previewVariant.sku}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-sm">
                    {previewVariant.sizeValue && <span className="rounded border px-2 py-1">Size: {previewVariant.sizeValue}</span>}
                    {previewVariant.color && <span className="flex items-center gap-2 rounded border px-2 py-1"><span className="h-3 w-3 rounded-full border" style={{ backgroundColor: previewVariant.color.hexCode }} />{previewVariant.color.name}</span>}
                    <span className="rounded border px-2 py-1">{previewVariant.stock} in stock</span>
                  </div>
                  <p className="mt-3 text-lg font-semibold">{formatPrice(previewVariant.price ?? previewVariant.product.salePrice ?? previewVariant.product.basePrice)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <label htmlFor="preview-quantity" className="text-sm font-medium">Quantity</label>
                  <Input id="preview-quantity" type="number" min={1} max={previewVariant.stock} value={previewQuantity} onChange={(event) => setPreviewQuantity(Math.max(1, Math.min(previewVariant.stock, Number(event.target.value) || 1)))} className="w-24" />
                  <Button type="button" className="ml-auto" disabled={previewVariant.stock < 1} onClick={() => addItem(previewVariant, previewQuantity)}>Add variant</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </form>
  )
}
