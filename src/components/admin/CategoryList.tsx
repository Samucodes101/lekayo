"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import { deleteCategory } from "@/actions/category.actions"

export default function CategoryList({ categories }: { categories: any[] }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return
    setDeletingId(id)

    try {
      await deleteCategory(id)
      toast({ title: "Category deleted" })
      router.refresh()
    } catch (error: any) {
      toast({ title: "Unable to delete category", description: error?.message || "Please remove dependent products first.", variant: "destructive" })
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
          <TableHead>Subcategories</TableHead>
          <TableHead>Featured</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category) => (
          <TableRow key={category.id}>
            <TableCell>{category.name}</TableCell>
            <TableCell>{category.slug}</TableCell>
            <TableCell>{category.subcategories?.length ?? 0}</TableCell>
            <TableCell>{category.featured ? "✓" : "-"}</TableCell>
            <TableCell className="flex gap-2">
              <Link href={`/admin/categories/${category.id}`} className="text-blue-600 underline">Edit</Link>
              <Button type="button" variant="destructive" size="sm" onClick={() => handleDelete(category.id)} disabled={deletingId === category.id}>
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
