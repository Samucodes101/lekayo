import { prisma } from "@/lib/db"
import { SearchableOrders } from "@/components/admin/SearchableAdminTables"

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { user: true, items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif">Orders</h1>
      </div>

      <SearchableOrders orders={orders.map((order) => ({ id: order.id, orderNumber: order.orderNumber, email: order.user.email, phone: order.user.phone, createdAt: order.createdAt.toISOString(), total: order.total, status: order.status }))} />
    </div>
  )
}