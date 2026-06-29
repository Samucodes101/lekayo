import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)
  const orders = await prisma.order.findMany({
    where: { user: { email: session!.user.email! } },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { variant: { include: { product: true } } } } }
  })

  return (
    <div>
      <h1 className="text-2xl font-serif mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Order #{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(order.total)}</p>
                  <p className="text-sm capitalize">{order.status}</p>
                  <Link href={`/account/orders/${order.id}`} className="text-sm underline">View Details</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}