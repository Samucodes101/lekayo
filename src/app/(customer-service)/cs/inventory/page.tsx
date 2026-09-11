"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import { useLiveSearch } from "@/hooks/useLiveSearch"

export default function CSInventoryPage() {
  const [search, setSearch] = useState("")
  const { results, loading } = useLiveSearch<any>(search, "/api/inventory/search")

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif">Inventory Lookup</h1>
      <Input placeholder="Search by SKU or product name" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />
      {loading && <p className="text-sm text-gray-500">Searching...</p>}
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
                  <TableCell>{formatPrice(v.price || v.product.basePrice)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}