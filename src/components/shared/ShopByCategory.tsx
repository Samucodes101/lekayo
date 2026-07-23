import Link from "next/link"
import Image from "next/image"
import { Category } from "@prisma/client"

interface ShopByCategoryProps {
  categories: Category[]
}

export default function ShopByCategory({ categories }: ShopByCategoryProps) {
  if (!categories.length) return null

  return (
    <section className="container mx-auto py-16">
      <h2 className="text-3xl font-serif text-center mb-12">Shop by Category</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
        {categories.map((category) => (
          <Link key={category.id} href={`/shop/${category.slug}`} className="group text-center">
            <div className="aspect-square bg-gray-50 rounded-sm overflow-hidden flex items-center justify-center p-4 transition group-hover:shadow-sm">
              {category.banner ? (
                <Image src={category.banner} alt={category.name} width={120} height={120} className="object-contain" />
              ) : (
                <span className="text-lg font-semibold">{category.name.slice(0, 2)}</span>
              )}
            </div>
            <p className="text-center mt-2 text-sm font-medium">{category.name}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}