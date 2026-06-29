import { prisma } from "@/lib/db"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { InventoryTable } from "@/components/admin/InventoryTable"

export default async function InventoryPage() {
  const variants = await prisma.productVariant.findMany({
    include: { product: true },
    orderBy: { stock: "asc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif">Inventory</h1>
        <Button asChild><Link href="/admin/inventory/history">View Logs</Link></Button>
      </div>
      <InventoryTable variants={variants} />
    </div>
  )
}