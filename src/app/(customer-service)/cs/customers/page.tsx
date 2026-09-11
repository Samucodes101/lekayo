"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLiveSearch } from "@/hooks/useLiveSearch"

export default function CSCustomersPage() {
  const [search, setSearch] = useState("")
  const { results, loading } = useLiveSearch<any>(search, "/api/customers/search")

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif">Customer Lookup</h1>
      <Input placeholder="Search by name, email, or phone" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />
      {loading && <p className="text-sm text-gray-500">Searching...</p>}
      <Card>
        <CardHeader><CardTitle>Results</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name || "N/A"}</TableCell>
                  <TableCell>{user.email || user.phone || "No contact"}</TableCell>
                  <TableCell>{user._count?.orders || 0}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}