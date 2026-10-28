import { prisma } from "@/lib/db"
import Link from "next/link"
import Image from "next/image"

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } })

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-gray-500">Our labels</p>
        <h1 className="text-3xl font-serif sm:text-4xl">Explore the brands behind the look</h1>
        <p className="mt-4 text-sm text-gray-600 sm:text-base">
          Discover premium labels and statement makers chosen for craftsmanship, style, and everyday confidence.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
        {brands.map((brand) => (
          <Link key={brand.id} href={`/brands/${brand.slug}`} className="group block text-center">
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-sm bg-gray-50 transition-colors duration-300 group-hover:bg-gray-100">
              {brand.logo ? (
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  fill
                  sizes="(min-width: 1024px) 320px, 33vw"
                  className="object-contain p-4 transition-transform duration-500 group-hover:scale-105 sm:p-8 lg:p-10"
                />
              ) : (
                <span className="px-2 text-sm font-semibold uppercase tracking-[0.15em] text-gray-800 sm:text-lg">
                  {brand.name}
                </span>
              )}
            </div>
            <h2 className="mt-2 truncate text-xs font-medium text-gray-800 sm:mt-3 sm:text-sm">{brand.name}</h2>
          </Link>
        ))}
      </div>
    </div>
  )
}