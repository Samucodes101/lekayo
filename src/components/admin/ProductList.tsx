"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatPrice } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { deleteProduct } from "@/actions/product.actions"

export type ProductRow = {
  id: string
  slug: string
  name: string
  sku: string
  status: string
  featured: boolean
  basePrice: number
  salePrice: number | null
  brand: string
  category: string
  subcategory: string | null
  variantCount: number
  totalStock: number
  image: string | null
}

function StatusBadge({ status }: { status: string }) {
  if (status === "PUBLISHED")
    return <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Published</span>
  if (status === "DRAFT")
    return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">Draft</span>
  return <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">Archived</span>
}

function FeaturedBadge({ featured }: { featured: boolean }) {
  if (!featured) return <span className="text-xs text-muted-foreground">—</span>
  return <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">★ Featured</span>
}

export default function ProductList({
  rows,
  readOnly = false,
}: {
  rows: ProductRow[]
  readOnly?: boolean
}) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return
    setDeletingId(id)

    try {
      const result = await deleteProduct(id)
      toast({ title: result?.archived ? "Product archived" : "Product deleted" })
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
          <TableHead>Product</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Brand</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Featured</TableHead>
          <TableHead>Variants / Stock</TableHead>
          {!readOnly && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 && (
          <TableRow>
            <TableCell colSpan={readOnly ? 8 : 9} className="py-10 text-center text-muted-foreground">
              No products match these filters.
            </TableCell>
          </TableRow>
        )}
        {rows.map((product) => (
          <TableRow key={product.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-gray-100">
                  <Image
                    src={product.image || "/placeholder.png"}
                    alt={product.name}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.png"
                    }}
                  />
                </div>
                <Link
                  href={readOnly ? `/products/${product.slug}` : `/admin/products/${product.id}`}
                  className="font-medium text-blue-600 underline-offset-2 hover:underline"
                >
                  {product.name}
                </Link>
              </div>
            </TableCell>
            <TableCell className="font-mono text-xs">{product.sku}</TableCell>
            <TableCell>{product.brand}</TableCell>
            <TableCell>
              {product.category}
              {product.subcategory && (
                <span className="text-muted-foreground"> › {product.subcategory}</span>
              )}
            </TableCell>
            <TableCell className="text-right">{formatPrice(product.salePrice ?? product.basePrice)}</TableCell>
            <TableCell>
              <StatusBadge status={product.status} />
            </TableCell>
            <TableCell>
              <FeaturedBadge featured={product.featured} />
            </TableCell>
            <TableCell>
              <span className="text-sm">{product.variantCount}</span>
              <span className="text-muted-foreground"> · </span>
              <span className="text-sm">{product.totalStock} in stock</span>
            </TableCell>
            {!readOnly && (
              <TableCell className="space-x-2 text-right">
                <Link
                  href={`/admin/products/${product.id}`}
                  className="text-blue-600 underline underline-offset-2"
                >
                  Edit
                </Link>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(product.id)}
                  disabled={deletingId === product.id}
                >
                  Delete
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
