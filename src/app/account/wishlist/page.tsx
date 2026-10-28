"use client"

import { useEffect, useState } from "react"
import { useActiveWishlist } from "@/hooks/useActiveWishlist"
import ProductGrid from "@/components/shared/ProductGrid"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function WishlistPage() {
  const { items } = useActiveWishlist()
  const [products, setProducts] = useState<any[] | null>(null)
  const idsKey = items.map((i) => i.id).join(",")

  // Stored wishlist items are snapshots; load live product data so prices and
  // flash sales are current.
  useEffect(() => {
    if (!idsKey) {
      setProducts([])
      return
    }
    let cancelled = false
    fetch("/api/wishlist/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: idsKey.split(",") }),
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) setProducts(data)
      })
      .catch(() => {
        if (!cancelled) setProducts([])
      })
    return () => {
      cancelled = true
    }
  }, [idsKey])

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
      {products === null ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-5 lg:gap-6">
          {items.map((item) => (
            <div key={item.id} className="animate-pulse">
              <div className="aspect-square bg-gray-100" />
              <div className="mt-4 h-4 w-3/4 bg-gray-100" />
              <div className="mt-2 h-4 w-1/3 bg-gray-100" />
            </div>
          ))}
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  )
}
