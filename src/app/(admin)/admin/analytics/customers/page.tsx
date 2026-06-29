import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"

export default async function CustomerAnalyticsPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: { orders: { where: { status: { not: "CANCELLED" } } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  const customersWithSpend = customers.map((c) => ({
    ...c,
    totalSpent: c.orders.reduce((sum, o) => sum + o.total, 0),
    orderCount: c.orders.length,
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif">Customer Analytics</h1>

      <Card>
        <CardHeader><CardTitle>Top Customers by Spend</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customersWithSpend
                .sort((a, b) => b.totalSpent - a.totalSpent)
                .slice(0, 10)
                .map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.name || "N/A"}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell>{c.orderCount}</TableCell>
                    <TableCell>{formatPrice(c.totalSpent)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}