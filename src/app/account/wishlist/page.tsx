"use client"

import { useWishlistStore } from "@/stores/wishlistStore"
import ProductGrid from "@/components/shared/ProductGrid"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function WishlistPage() {
  const { items } = useWishlistStore()

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-serif mb-4">Your wishlist is empty</h1>
        <p className="text-gray-500 mb-6">Save your favorite items here.</p>
        <Button asChild><Link href="/shop">Start Shopping</Link></Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif mb-6">My Wishlist</h1>
      <ProductGrid products={items as any} />
    </div>
  )
}