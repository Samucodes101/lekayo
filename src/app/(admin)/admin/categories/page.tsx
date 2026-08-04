import { prisma } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import CategoryList from "@/components/admin/CategoryList"

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { subcategories: true },
    orderBy: { order: "asc" },
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-serif">Categories</h1>
        <Button asChild><Link href="/admin/categories/new">Add Category</Link></Button>
      </div>
      <CategoryList categories={categories} />
    </div>
  )
}