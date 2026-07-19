// src/components/shared/Receipt.tsx
import { Order } from "@prisma/client"
import { formatPrice } from "@/lib/utils"

interface ReceiptProps {
  order: Order & {
    items: Array<{
      id: string
      quantity: number
      unitPrice: number
      totalPrice: number
      variant: {
        product: { name: string }
        sku: string
      }
    }>
    user: { name: string | null; email: string }
    shippingAddress: {
      addressLine1: string
      city: string
      state: string
      postalCode: string
      country: string
    } | null
  }
}

export default function Receipt({ order }: ReceiptProps) {
  return (
    <div className="max-w-2xl mx-auto p-8 bg-white print:shadow-none" id="receipt">
      {/* Header */}
      <div className="text-center border-b pb-4">
        <h1 className="text-3xl font-serif">LEKAYO</h1>
        <p className="text-sm text-gray-500">Luxury Fashion</p>
        <p className="text-xs text-gray-400">Receipt</p>
      </div>

      {/* Order Info */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <p className="font-semibold">Order #{order.orderNumber}</p>
          <p className="text-sm">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold">Status: {order.status}</p>
          <p className="text-sm">Payment: {order.paymentMethod || "N/A"}</p>
        </div>
      </div>

      {/* Customer & Shipping */}
      <div className="mt-4 border-t pt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="font-medium">Customer</p>
          <p>{order.user.name || order.user.email}</p>
          <p>{order.user.email}</p>
        </div>
        {order.shippingAddress && (
          <div>
            <p className="font-medium">Shipping Address</p>
            <p>{order.shippingAddress.addressLine1}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
            <p>{order.shippingAddress.country} - {order.shippingAddress.postalCode}</p>
          </div>
        )}
      </div>

      {/* Items Table */}
      <table className="w-full mt-6 border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Item</th>
            <th className="text-center py-2">SKU</th>
            <th className="text-center py-2">Qty</th>
            <th className="text-right py-2">Price</th>
            <th className="text-right py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="py-2">{item.variant.product.name}</td>
              <td className="text-center">{item.variant.sku}</td>
              <td className="text-center">{item.quantity}</td>
              <td className="text-right">{formatPrice(item.unitPrice)}</td>
              <td className="text-right">{formatPrice(item.totalPrice)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4} className="text-right font-medium">Subtotal</td>
            <td className="text-right">{formatPrice(order.subtotal)}</td>
          </tr>
          {order.discount > 0 && (
            <tr>
              <td colSpan={4} className="text-right font-medium">Discount</td>
              <td className="text-right">-{formatPrice(order.discount)}</td>
            </tr>
          )}
          <tr>
            <td colSpan={4} className="text-right font-medium">Shipping</td>
            <td className="text-right">{formatPrice(order.shippingCost)}</td>
          </tr>
          <tr className="font-bold">
            <td colSpan={4} className="text-right">Total</td>
            <td className="text-right">{formatPrice(order.total)}</td>
          </tr>
        </tfoot>
      </table>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500 border-t pt-4">
        <p>Thank you for shopping at Lekayo.</p>
        <p>Contact: hello@lekayo.com | +1 (555) 123-4567</p>
      </div>
    </div>
  )
}