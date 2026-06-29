import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { notFound } from "next/navigation"
import { formatPrice } from "@/lib/utils"
import Image from "next/image"

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const order = await prisma.order.findFirst({
    where: { id: params.id, user: { email: session!.user.email! } },
    include: { items: { include: { variant: { include: { product: true, images: true } } } }, shippingAddress: true }
  })
  if (!order) notFound()

  return (
    <div>
      <h1 className="text-2xl font-serif mb-4">Order #{order.orderNumber}</h1>
      <div className="space-y-6">
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Items</h2>
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 py-2 border-b last:border-0">
              <Image src={item.variant.images[0]?.url || "/placeholder.png"} alt="" width={60} height={60} className="rounded" />
              <div className="flex-1">
                <p className="font-medium">{item.variant.product.name}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity} × {formatPrice(item.unitPrice)}</p>
              </div>
              <p className="font-semibold">{formatPrice(item.totalPrice)}</p>
            </div>
          ))}
        </div>
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Shipping Address</h2>
          <p>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
          <p>{order.shippingAddress?.addressLine1}</p>
          <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</p>
          <p>{order.shippingAddress?.country}</p>
        </div>
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Summary</h2>
          <div className="space-y-1">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{formatPrice(order.shippingCost)}</span></div>
            <div className="flex justify-between font-bold border-t pt-2"><span>Total</span><span>{formatPrice(order.total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}