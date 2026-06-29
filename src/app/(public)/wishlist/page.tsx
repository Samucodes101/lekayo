"use client"

import { useWishlistStore } from "@/stores/wishlistStore"
import ProductGrid from "@/components/shared/ProductGrid"

export default function WishlistPage() {
  const items = useWishlistStore((state) => state.items)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif mb-6">My Wishlist</h1>
      <ProductGrid products={items} />
    </div>
  )
}