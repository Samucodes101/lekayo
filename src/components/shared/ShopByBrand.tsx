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
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 lg:gap-6">
        {brands.map((brand) => (
          <Link key={brand.id} href={`/brands/${brand.slug}`} className="group">
            <div className="aspect-square rounded-sm overflow-hidden flex items-center justify-center p-4">
              {brand.logo ? (
                <Image src={brand.logo} alt={brand.name} width={140} height={140} className="object-contain" />
              ) : (
                <span className="text-lg font-semibold">{brand.name}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}