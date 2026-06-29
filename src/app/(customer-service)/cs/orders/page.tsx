"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"

export default function CSOrdersPage() {
  const [search, setSearch] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (search.length < 2) return
    setLoading(true)
    const res = await fetch(`/api/orders/search?q=${search}`)
    const data = await res.json()
    setResults(data)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif">Order Search</h1>
      <div className="flex gap-2">
        <Input placeholder="Search by order #" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />
        <Button onClick={handleSearch} disabled={loading}>Search</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>Results</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((order) => (
                <TableRow key={order.id}>
                  <TableCell><Link href={`/admin/orders/${order.id}`} className="text-blue-600 underline">{order.orderNumber}</Link></TableCell>
                  <TableCell>{order.user.email}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{formatPrice(order.total)}</TableCell>
                  <TableCell className="capitalize">{order.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}