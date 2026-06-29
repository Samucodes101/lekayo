import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function InventoryAnalyticsPage() {
  const variants = await prisma.productVariant.findMany({
    include: { product: true },
    orderBy: { stock: "asc" },
    take: 100,
  })

  const lowStock = variants.filter((v) => v.stock < 10)
  const outOfStock = variants.filter((v) => v.stock === 0)
  const totalValue = variants.reduce((sum, v) => sum + (v.price || v.product.basePrice) * v.stock, 0)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif">Inventory Analytics</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Total Inventory Value</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">${totalValue.toFixed(2)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Low Stock Items</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-yellow-600">{lowStock.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Out of Stock</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-red-600">{outOfStock.length}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Low Stock Items</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStock.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>{v.product.name}</TableCell>
                  <TableCell>{v.sku}</TableCell>
                  <TableCell className="text-yellow-600">{v.stock}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}