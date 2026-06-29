import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import BrandForm from "@/components/forms/BrandForm"

export default async function EditBrandPage({ params }: { params: { id: string } }) {
  const brand = await prisma.brand.findUnique({ where: { id: params.id } })
  if (!brand) notFound()

  return (
    <div>
      <h1 className="text-2xl font-serif mb-6">Edit Brand: {brand.name}</h1>
      <BrandForm brand={brand} />
    </div>
  )
}