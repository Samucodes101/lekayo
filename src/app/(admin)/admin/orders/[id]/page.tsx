import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { updateOrderStatus } from "@/actions/order.actions"
import { OrderStatus } from "@prisma/client"
import Link from "next/link"

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-right font-medium break-words">{value || "—"}</dd>
    </div>
  )
}

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      items: { include: { variant: { include: { product: true, images: true } } } },
      shippingAddress: true,
      billingAddress: true,
    },
  })
  if (!order) notFound()

  const isPickup = order.deliveryLocation === "pickup"
  const statuses: OrderStatus[] = ["PENDING", "PAID", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif">Order #{order.orderNumber}</h1>
  <div className="flex gap-2">
    <Link
      href={`/admin/orders/${order.id}/print`}
      target="_blank"
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
       Print Receipt
    </Link>
    {/* other buttons like status update */}
  </div>
<form
  action={async (formData: FormData) => {
    "use server"
    await updateOrderStatus(formData)
  }}
>
  <input type="hidden" name="orderId" value={order.id} />
  <select name="status" defaultValue={order.status} className="border rounded p-2 mr-2">
    {statuses.map((s) => (
      <option key={s} value={s}>{s}</option>
    ))}
  </select>
  <Button type="submit">Update Status</Button>
</form>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <DetailRow label="Name" value={order.customerName || order.user?.name} />
              <DetailRow label="Email" value={order.email || order.user?.email} />
              <DetailRow label="Phone" value={order.customerPhone || order.shippingAddress?.phone || order.user?.phone} />
              <DetailRow label="Account" value={order.user ? "Registered customer" : order.email ? "Guest checkout" : "Walk-in customer"} />
              <DetailRow label="Placed" value={new Date(order.createdAt).toLocaleString()} />
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Delivery</CardTitle></CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <DetailRow label="Method" value={isPickup ? "Pickup" : order.shippingAddress || order.deliveryLocation ? "Delivery" : null} />
              {!isPickup && <DetailRow label="Shipping option" value={order.deliveryLocation} />}
              <DetailRow label="Shipping cost" value={formatPrice(order.shippingCost)} />
              {order.shippingAddress && (
                <>
                  <DetailRow label="Recipient" value={`${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`} />
                  <DetailRow label="Address" value={[order.shippingAddress.addressLine1, order.shippingAddress.addressLine2].filter(Boolean).join(", ")} />
                  <DetailRow label="City" value={order.shippingAddress.city} />
                  <DetailRow label="State" value={order.shippingAddress.state} />
                  <DetailRow label="Postal code" value={order.shippingAddress.postalCode} />
                  <DetailRow label="Country" value={order.shippingAddress.country} />
                  <DetailRow label="Phone" value={order.shippingAddress.phone} />
                </>
              )}
              {order.notes && <DetailRow label="Notes" value={order.notes} />}
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Items</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.variant.product.name}</TableCell>
                  <TableCell>{item.variant.sku}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatPrice(item.unitPrice)}</TableCell>
                  <TableCell>{formatPrice(item.totalPrice)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            {order.discount > 0 && <div className="flex justify-between"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>}
            <div className="flex justify-between"><span>Shipping</span><span>{formatPrice(order.shippingCost)}</span></div>
            <div className="flex justify-between font-bold border-t pt-2"><span>Total</span><span>{formatPrice(order.total)}</span></div>
            <div className="text-sm text-gray-500">Payment: {order.paymentMethod || "N/A"} {order.paidAt && `✓ Paid at ${new Date(order.paidAt).toLocaleString()}`}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}