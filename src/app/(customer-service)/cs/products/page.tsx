"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"

export default function CSProductsPage() {
  const [search, setSearch] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (search.length < 2) return
    setLoading(true)
    const res = await fetch(`/api/products/search?q=${search}`)
    const data = await res.json()
    setResults(data)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif">Product Search</h1>
      <div className="flex gap-2">
        <Input placeholder="Search by name, SKU, or brand" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />
        <Button onClick={handleSearch} disabled={loading}>Search</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>Results</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((p) => (
                <TableRow key={p.id}>
                  <TableCell><Link href={`/products/${p.slug}`} className="text-blue-600 underline">{p.name}</Link></TableCell>
                  <TableCell>{p.sku}</TableCell>
                  <TableCell>{p.brand?.name}</TableCell>
                  <TableCell>{formatPrice(p.salePrice || p.basePrice)}</TableCell>
                  <TableCell>{p.variants?.[0]?.stock || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}