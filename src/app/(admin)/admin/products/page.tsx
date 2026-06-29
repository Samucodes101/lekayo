import { prisma } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatPrice } from "@/lib/utils"

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ include: { brand: true, category: true }, orderBy: { createdAt: "desc" } })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-serif">Products</h1>
        <Button asChild><Link href="/admin/products/new">Add Product</Link></Button>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>SKU</TableHead><TableHead>Brand</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.sku}</TableCell>
              <TableCell>{p.brand.name}</TableCell>
              <TableCell>{formatPrice(p.salePrice ?? p.basePrice)}</TableCell>
              <TableCell>{p.status}</TableCell>
              <TableCell><Link href={`/admin/products/${p.id}`} className="text-blue-600 underline">Edit</Link></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}