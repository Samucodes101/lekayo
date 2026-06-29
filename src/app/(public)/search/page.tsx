"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import ProductGrid from "@/components/shared/ProductGrid"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialQuery.length > 1) {
      setLoading(true)
      fetch(`/api/search?q=${initialQuery}`).then(res => res.json()).then(data => { setResults(data); setLoading(false) })
    }
  }, [initialQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    window.history.pushState({}, "", `/search?q=${query}`)
    fetch(`/api/search?q=${query}`).then(res => res.json()).then(setResults)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif mb-6">Search</h1>
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products, brands..." className="max-w-md" />
        <Button type="submit">Search</Button>
      </form>
      {loading ? <p>Loading...</p> : <ProductGrid products={results} />}
    </div>
  )
}