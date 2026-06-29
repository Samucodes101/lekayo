import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import CategoryForm from "@/components/forms/CategoryForm"

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const category = await prisma.category.findUnique({ where: { id: params.id } })
  if (!category) notFound()

  return (
    <div>
      <h1 className="text-2xl font-serif mb-6">Edit Category: {category.name}</h1>
      <CategoryForm category={category} />
    </div>
  )
}