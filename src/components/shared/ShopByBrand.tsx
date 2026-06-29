import Link from "next/link"
import Image from "next/image"
import { Brand } from "@prisma/client"

interface ShopByBrandProps {
  brands: Brand[]
}

export default function ShopByBrand({ brands }: ShopByBrandProps) {
  if (!brands.length) return null

  return (
    <section className="container mx-auto py-16">
      <h2 className="text-3xl font-serif text-center mb-12">Shop By Brand</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
        {brands.map((brand) => (
          <Link key={brand.id} href={`/brands/${brand.slug}`} className="group">
            <div className="aspect-square bg-gray-100 rounded-full overflow-hidden flex items-center justify-center p-4 transition group-hover:shadow-lg">
              {brand.logo ? (
                <Image src={brand.logo} alt={brand.name} width={120} height={120} className="object-contain" />
              ) : (
                <span className="text-lg font-semibold">{brand.name}</span>
              )}
            </div>
            <p className="text-center mt-2 text-sm font-medium">{brand.name}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}