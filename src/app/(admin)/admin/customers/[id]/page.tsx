import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      orders: {
        include: { items: { include: { variant: { include: { product: true } } } } },
        orderBy: { createdAt: "desc" },
      },
      addresses: true,
    },
  })
  if (!customer) notFound()

  const totalSpent = customer.orders.reduce((sum, o) => sum + o.total, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif">{customer.name || "Customer"}</h1>
        <div className="text-sm text-gray-500">Joined {new Date(customer.createdAt).toLocaleDateString()}</div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle>Email</CardTitle></CardHeader><CardContent>{customer.email}</CardContent></Card>
        <Card><CardHeader><CardTitle>Total Orders</CardTitle></CardHeader><CardContent>{customer.orders.length}</CardContent></Card>
        <Card><CardHeader><CardTitle>Total Spent</CardTitle></CardHeader><CardContent>{formatPrice(totalSpent)}</CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Order History</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customer.orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{formatPrice(order.total)}</TableCell>
                  <TableCell className="capitalize">{order.status}</TableCell>
                  <TableCell><Link href={`/admin/orders/${order.id}`} className="text-blue-600 underline">View</Link></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Addresses</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Phone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customer.addresses.map((addr) => (
                <TableRow key={addr.id}>
                  <TableCell>{addr.firstName} {addr.lastName}</TableCell>
                  <TableCell>{addr.addressLine1}, {addr.city}, {addr.state}</TableCell>
                  <TableCell>{addr.phone}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}