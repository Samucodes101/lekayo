import { prisma } from '@/lib/db'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function InventoryHistoryPage() {
  const logs = await prisma.inventoryLog.findMany({
    include: { variant: { include: { product: true } }, user: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif">Inventory History</h1>
      <Card>
        <CardHeader><CardTitle>All Stock Changes</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Previous</TableHead>
                <TableHead>New</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{log.variant.product.name}</TableCell>
                  <TableCell>{log.variant.sku}</TableCell>
                  <TableCell>{log.previousStock}</TableCell>
                  <TableCell>{log.newStock}</TableCell>
                  <TableCell className={log.changeAmount > 0 ? 'text-green-600' : 'text-red-600'}>
                    {log.changeAmount > 0 ? '+' : ''}{log.changeAmount}
                  </TableCell>
                  <TableCell>{log.reason}</TableCell>
                  <TableCell>{log.user?.email || 'System'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}