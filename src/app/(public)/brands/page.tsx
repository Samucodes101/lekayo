import { prisma } from "@/lib/db"
import Link from "next/link"
import Image from "next/image"

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } })

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif mb-8">All Brands</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {brands.map((brand) => (
          <Link key={brand.id} href={`/brands/${brand.slug}`} className="group text-center">
            <div className="aspect-square bg-gray-100 rounded-full overflow-hidden flex items-center justify-center p-6 mb-3 group-hover:shadow-lg transition">
              {brand.logo ? <Image src={brand.logo} alt={brand.name} width={120} height={120} /> : <span className="text-xl font-bold">{brand.name}</span>}
            </div>
            <h2 className="font-medium">{brand.name}</h2>
          </Link>
        ))}
      </div>
    </div>
  )
}