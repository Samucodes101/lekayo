"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { updateStock } from "@/actions/inventory.actions"

export type InventoryRow = {
  id: string
  sku: string
  productName: string
  brand: string
  category: string
  subcategory: string | null
  colorName: string | null
  colorHex: string | null
  sizeValue: string | null
  price: number
  stock: number
}

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
})

function StockBadge({ stock, threshold }: { stock: number; threshold: number }) {
  if (stock <= 0)
    return <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">Out</span>
  if (stock <= threshold)
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">Low</span>
    )
  return null
}

export function InventoryTable({
  rows,
  lowStockThreshold,
}: {
  rows: InventoryRow[]
  lowStockThreshold: number
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState<string | null>(null)
  const [newStock, setNewStock] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)

  const cancel = () => {
    setEditing(null)
    setError(null)
  }

  const handleUpdate = (variantId: string) => {
    if (!Number.isInteger(newStock) || newStock < 0) {
      setError("Stock must be a whole number, 0 or more")
      return
    }
    setError(null)
    startTransition(async () => {
      try {
        await updateStock(variantId, newStock)
        setEditing(null)
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to update stock")
      }
    })
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Colour / Size</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                No variants match these filters.
              </TableCell>
            </TableRow>
          )}
          {rows.map((v) => (
            <TableRow key={v.id}>
              <TableCell className="font-mono text-xs">{v.sku}</TableCell>
              <TableCell>{v.productName}</TableCell>
              <TableCell>{v.brand}</TableCell>
              <TableCell>
                {v.category}
                {v.subcategory && (
                  <span className="text-muted-foreground"> › {v.subcategory}</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {v.colorHex && (
                    <span
                      className="inline-block h-3 w-3 rounded-full border"
                      style={{ backgroundColor: v.colorHex }}
                    />
                  )}
                  <span>
                    {[v.colorName, v.sizeValue].filter(Boolean).join(" / ") || "—"}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">{naira.format(v.price)}</TableCell>
              <TableCell>
                {editing === v.id ? (
                  <Input
                    type="number"
                    min={0}
                    autoFocus
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdate(v.id)
                      if (e.key === "Escape") cancel()
                    }}
                    className="w-24"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{v.stock}</span>
                    <StockBadge stock={v.stock} threshold={lowStockThreshold} />
                  </div>
                )}
              </TableCell>
              <TableCell className="space-x-2 text-right">
                {editing === v.id ? (
                  <>
                    <Button size="sm" disabled={isPending} onClick={() => handleUpdate(v.id)}>
                      {isPending ? "Saving…" : "Save"}
                    </Button>
                    <Button size="sm" variant="ghost" disabled={isPending} onClick={cancel}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(v.id)
                      setNewStock(v.stock)
                      setError(null)
                    }}
                  >
                    Edit
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}