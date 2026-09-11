import { prisma } from "@/lib/db"
import { SearchableCustomers } from "@/components/admin/SearchableAdminTables"

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
      </div>

      <SearchableCustomers customers={customersWithStats.map((customer) => ({ ...customer, createdAt: customer.createdAt.toISOString() }))} />
    </div>
  )
}