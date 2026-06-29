import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import { RevenueChart } from "@/components/admin/AnalyticsCharts"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AnalyticsOverviewPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  // Get last 30 days data
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [totalRevenue, totalOrders, totalCustomers, revenueData] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: "CANCELLED" } } }),
    prisma.order.count({ where: { status: { not: "CANCELLED" } } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: thirtyDaysAgo }, status: { not: "CANCELLED" } },
      _sum: { total: true },
      orderBy: { createdAt: "asc" },
    }),
  ])

  const chartData = revenueData.map((item) => ({
    date: item.createdAt.toISOString().split("T")[0],
    revenue: item._sum.total || 0,
  }))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif">Analytics Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/analytics/sales">Sales</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/analytics/inventory">Inventory</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/analytics/customers">Customers</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Total Revenue</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{formatPrice(totalRevenue._sum.total || 0)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Orders</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{totalOrders}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Customers</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{totalCustomers}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Revenue (Last 30 Days)</CardTitle></CardHeader>
        <CardContent>
          <RevenueChart data={chartData} />
        </CardContent>
      </Card>
    </div>
  )
}