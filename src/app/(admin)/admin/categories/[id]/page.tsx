import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import CategoryForm from "@/components/forms/CategoryForm"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const category = await prisma.category.findUnique({
    where: { id: params.id },
    include: { subcategories: true },
  })
  if (!category) notFound()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif">Edit Category: {category.name}</h1>
        <Button asChild>
          <Link href={`/admin/categories/${category.id}/subcategories`}>
            Manage Subcategories
          </Link>
        </Button>
      </div>
      <CategoryForm category={category} />
    </div>
  )
}