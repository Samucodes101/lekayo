import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"

export default async function AdminDashboard() {
  const [totalProducts, totalOrders, totalCustomers, revenue] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: "CANCELLED" } } })
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader><CardTitle>Total Products</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{totalProducts}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Total Orders</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{totalOrders}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Customers</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{totalCustomers}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Revenue</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatPrice(revenue._sum.total || 0)}</p></CardContent></Card>
      </div>
    </div>
  )
}