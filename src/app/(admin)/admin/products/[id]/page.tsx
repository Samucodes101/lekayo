import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import ProductForm from "@/components/forms/ProductForm"

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { variants: { include: { images: true, color: true } } },
  })
  if (!product) notFound()

  return (
    <div>
      <h1 className="text-2xl font-serif mb-6">Edit Product: {product.name}</h1>
      <ProductForm product={product} />
    </div>
  )
}