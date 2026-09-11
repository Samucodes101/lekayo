"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import ProductGrid from "@/components/shared/ProductGrid"
import { Input } from "@/components/ui/input"
import { useLiveSearch } from "@/hooks/useLiveSearch"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const [query, setQuery] = useState(initialQuery)
  const { results, loading } = useLiveSearch<any>(query, "/api/search")

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif mb-6">Search</h1>
      <div className="mb-8">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products, brands, or categories..." className="max-w-md" />
      </div>
      {loading ? <p>Loading...</p> : <ProductGrid products={results} />}
    </div>
  )
}