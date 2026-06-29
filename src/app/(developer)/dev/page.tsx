import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DeveloperDashboard() {
  const [users, orders, products, variants] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.product.count(),
    prisma.productVariant.count(),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif">Developer Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader><CardTitle>Total Users</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{users}</CardContent></Card>
        <Card><CardHeader><CardTitle>Total Orders</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{orders}</CardContent></Card>
        <Card><CardHeader><CardTitle>Total Products</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{products}</CardContent></Card>
        <Card><CardHeader><CardTitle>Total Variants</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{variants}</CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>System Info</CardTitle></CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div className="flex justify-between border-b py-1"><dt>Node Version</dt><dd>{process.version}</dd></div>
            <div className="flex justify-between border-b py-1"><dt>Environment</dt><dd>{process.env.NODE_ENV}</dd></div>
            <div className="flex justify-between border-b py-1"><dt>Database</dt><dd>PostgreSQL (connected)</dd></div>
            <div className="flex justify-between py-1"><dt>Auth Provider</dt><dd>NextAuth (Credentials)</dd></div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}