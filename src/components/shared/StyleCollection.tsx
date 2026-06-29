import Link from "next/link"
import ProductGrid from "./ProductGrid"

interface StyleCollectionProps {
  collection: any
}

export default function StyleCollection({ collection }: StyleCollectionProps) {
  const products = collection.products.map((p: any) => p.product)

  return (
    <section className="container mx-auto py-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif">{collection.name}</h2>
        <p className="text-gray-600 mt-2">{collection.description}</p>
        <Link href={`/collections/${collection.slug}`} className="text-sm underline mt-2 inline-block">
          View All
        </Link>
      </div>
      <ProductGrid products={products} />
    </section>
  )
}