"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"
import { useLiveSearch } from "@/hooks/useLiveSearch"

export default function CSProductsPage() {
  const [search, setSearch] = useState("")
  const { results, loading } = useLiveSearch<any>(search, "/api/products/search")

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif">Product Search</h1>
      <Input placeholder="Search by name, SKU, brand, or category" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />
      {loading && <p className="text-sm text-gray-500">Searching...</p>}
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
                  <TableCell>{[...(p.variants || [])].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))[0]?.stock || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}