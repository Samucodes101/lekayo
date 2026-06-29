"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { updateStock } from "@/actions/inventory.actions"

export function InventoryTable({ variants }: { variants: any[] }) {
  const [editing, setEditing] = useState<string | null>(null)
  const [newStock, setNewStock] = useState<number>(0)

  const handleUpdate = async (variantId: string) => {
    await updateStock(variantId, newStock)
    setEditing(null)
  }

  return (
    <Table>
      <TableHeader><TableRow><TableHead>SKU</TableHead><TableHead>Product</TableHead><TableHead>Stock</TableHead><TableHead></TableHead></TableRow></TableHeader>
      <TableBody>
        {variants.map((v) => (
          <TableRow key={v.id}>
            <TableCell>{v.sku}</TableCell>
            <TableCell>{v.product.name}</TableCell>
            <TableCell>
              {editing === v.id ? (
                <Input type="number" value={newStock} onChange={(e) => setNewStock(Number(e.target.value))} className="w-24" />
              ) : v.stock}
            </TableCell>
            <TableCell>
              {editing === v.id ? (
                <Button size="sm" onClick={() => handleUpdate(v.id)}>Save</Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => { setEditing(v.id); setNewStock(v.stock) }}>Edit</Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}