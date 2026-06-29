import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatPrice } from "@/lib/utils"

export default async function VariantInventoryPage({ params }: { params: { variantId: string } }) {
  const variant = await prisma.productVariant.findUnique({
    where: { id: params.variantId },
    include: { product: true, inventoryLogs: { orderBy: { createdAt: "desc" }, take: 50 } },
  })
  if (!variant) notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif">Inventory: {variant.product.name} - {variant.sku}</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle>Current Stock</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{variant.stock}</CardContent></Card>
        <Card><CardHeader><CardTitle>Price</CardTitle></CardHeader><CardContent>{formatPrice(variant.price || variant.product.basePrice)}</CardContent></Card>
        <Card><CardHeader><CardTitle>SKU</CardTitle></CardHeader><CardContent>{variant.sku}</CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Inventory History</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Previous</TableHead>
                <TableHead>New</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variant.inventoryLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{log.previousStock}</TableCell>
                  <TableCell>{log.newStock}</TableCell>
                  <TableCell className={log.changeAmount > 0 ? "text-green-600" : "text-red-600"}>
                    {log.changeAmount > 0 ? "+" : ""}{log.changeAmount}
                  </TableCell>
                  <TableCell>{log.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}