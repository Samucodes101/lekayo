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

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/brands/${brand.slug}`}
            className="group block rounded-xl border border-gray-200 bg-white p-4 text-center transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-sm"
          >
            <div className="mb-3 aspect-square overflow-hidden rounded-lg bg-gray-100 p-4 transition group-hover:bg-gray-50">
              {brand.logo ? (
                <Image src={brand.logo} alt={brand.name} width={120} height={120} className="h-full w-full object-contain" />
              ) : (
                <span className="flex h-full items-center justify-center text-lg font-bold text-gray-800">{brand.name}</span>
              )}
            </div>
            <h2 className="text-sm font-medium text-gray-800">{brand.name}</h2>
          </Link>
        ))}
      </div>
    </div>
  )
}