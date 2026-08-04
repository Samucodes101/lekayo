"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import { deleteBrand } from "@/actions/brand.actions"

export default function BrandList({ brands }: { brands: any[] }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this brand?")) return
    setDeletingId(id)

    try {
      await deleteBrand(id)
      toast({ title: "Brand deleted" })
      router.refresh()
    } catch (error: any) {
      toast({ title: "Unable to delete brand", description: error?.message || "Please remove dependent products first.", variant: "destructive" })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Featured</TableHead>
          <TableHead>Products</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {brands.map((brand) => (
          <TableRow key={brand.id}>
            <TableCell>{brand.name}</TableCell>
            <TableCell>{brand.slug}</TableCell>
            <TableCell>{brand.featured ? "✓" : "-"}</TableCell>
            <TableCell>{brand._count?.products ?? "-"}</TableCell>
            <TableCell className="flex gap-2">
              <Link href={`/admin/brands/${brand.id}`} className="text-blue-600 underline">Edit</Link>
              <Button type="button" variant="destructive" size="sm" onClick={() => handleDelete(brand.id)} disabled={deletingId === brand.id}>
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
