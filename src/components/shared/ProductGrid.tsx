import { ProductWithVariants } from "@/types"
import ProductCard from "./ProductCard"

interface ProductGridProps {
  products: ProductWithVariants[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return <div className="text-center py-12 text-gray-500">No products found.</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}