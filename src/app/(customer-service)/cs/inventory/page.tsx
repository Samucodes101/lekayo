"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CSInventoryPage() {
  const [search, setSearch] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (search.length < 2) return
    setLoading(true)
    const res = await fetch(`/api/inventory/search?q=${search}`)
    const data = await res.json()
    setResults(data)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif">Inventory Lookup</h1>
      <div className="flex gap-2">
        <Input placeholder="Search by SKU or product name" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />
        <Button onClick={handleSearch} disabled={loading}>Search</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>Results</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>{v.product.name}</TableCell>
                  <TableCell>{v.sku}</TableCell>
                  <TableCell className={v.stock < 10 ? "text-red-600" : ""}>{v.stock}</TableCell>
                  <TableCell>${(v.price || v.product.basePrice).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}