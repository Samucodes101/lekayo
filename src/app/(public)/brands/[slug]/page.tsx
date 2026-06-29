import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import ProductGrid from "@/components/shared/ProductGrid"
import Image from "next/image"

export default async function BrandPage({ params }: { params: { slug: string } }) {
  const brand = await prisma.brand.findUnique({ where: { slug: params.slug }, include: { products: { include: { variants: { include: { images: true } } } } } })
  if (!brand) notFound()

  return (
    <div className="container mx-auto px-4 py-8">
      {brand.banner && (
        <div className="relative h-64 w-full rounded-xl overflow-hidden mb-8">
          <Image src={brand.banner} alt={brand.name} fill className="object-cover" />
        </div>
      )}
      <h1 className="text-3xl font-serif mb-2">{brand.name}</h1>
      <p className="text-gray-600 mb-6">{brand.description}</p>
      <ProductGrid products={brand.products as any} />
    </div>
  )
}