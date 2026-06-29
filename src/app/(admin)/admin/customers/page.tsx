import { prisma } from "@/lib/db"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function CustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: { orders: { where: { status: { not: "CANCELLED" } } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  const customersWithStats = customers.map((c) => ({
    ...c,
    totalSpent: c.orders.reduce((sum, o) => sum + o.total, 0),
    orderCount: c.orders.length,
  }))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif">Customers</h1>
        <div className="flex gap-2">
          <Input placeholder="Search customers..." className="w-48" />
          <Button variant="outline">Search</Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead>Total Spent</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customersWithStats.map((c) => (
            <TableRow key={c.id}>
              <TableCell>{c.name || "N/A"}</TableCell>
              <TableCell>{c.email}</TableCell>
              <TableCell>{c.orderCount}</TableCell>
              <TableCell>${c.totalSpent.toFixed(2)}</TableCell>
              <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Link href={`/admin/customers/${c.id}`} className="text-blue-600 underline">View</Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}