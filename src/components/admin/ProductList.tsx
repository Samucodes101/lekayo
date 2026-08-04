"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatPrice } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { deleteProduct } from "@/actions/product.actions"

export default function ProductList({ products }: { products: any[] }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return
    setDeletingId(id)

    try {
      await deleteProduct(id)
      toast({ title: "Product deleted" })
      router.refresh()
    } catch (error: any) {
      toast({ title: "Unable to delete product", description: error?.message || "Please remove dependent records first.", variant: "destructive" })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Brand</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Status</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>{product.name}</TableCell>
            <TableCell>{product.sku}</TableCell>
            <TableCell>{product.brand?.name}</TableCell>
            <TableCell>{formatPrice(product.salePrice ?? product.basePrice)}</TableCell>
            <TableCell>{product.status}</TableCell>
            <TableCell className="flex gap-2">
              <Link href={`/admin/products/${product.id}`} className="text-blue-600 underline">Edit</Link>
              <Button type="button" variant="destructive" size="sm" onClick={() => handleDelete(product.id)} disabled={deletingId === product.id}>
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
