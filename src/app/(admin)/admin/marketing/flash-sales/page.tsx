"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import FlashSaleForm from "@/components/marketing/FlashSaleForm"

type SaleStatus = "Live" | "Scheduled" | "Ended" | "Inactive"

function getStatus(sale: any): SaleStatus {
  if (!sale.active) return "Inactive"
  // Use the server's verdict when available — it's what the storefront uses
  if (typeof sale.liveOnServer === "boolean") {
    if (sale.liveOnServer) return "Live"
    return new Date(sale.startsAt) > new Date(sale.serverNow) ? "Scheduled" : "Ended"
  }
  const now = new Date()
  if (new Date(sale.startsAt) > now) return "Scheduled"
  if (new Date(sale.endsAt) < now) return "Ended"
  return "Live"
}

const statusStyles: Record<SaleStatus, string> = {
  Live: "bg-green-100 text-green-700",
  Scheduled: "bg-blue-100 text-blue-700",
  Ended: "bg-gray-100 text-gray-500",
  Inactive: "bg-gray-100 text-gray-500",
}

/** Short summary of what a sale discounts, e.g. "20% off everything · 2 categories". */
function describeDiscounts(sale: any) {
  const c = sale.criteria ?? {}
  const parts: string[] = []
  if (c.allProductsDiscount) parts.push(`${c.allProductsDiscount.discountValue}% off everything`)
  if (c.categoryDiscounts?.length) parts.push(`${c.categoryDiscounts.length} categor${c.categoryDiscounts.length === 1 ? "y" : "ies"}`)
  if (c.subcategoryDiscounts?.length) parts.push(`${c.subcategoryDiscounts.length} subcategor${c.subcategoryDiscounts.length === 1 ? "y" : "ies"}`)
  if (c.brandDiscounts?.length) parts.push(`${c.brandDiscounts.length} brand${c.brandDiscounts.length === 1 ? "" : "s"}`)
  if (sale.products?.length) parts.push(`${sale.products.length} product${sale.products.length === 1 ? "" : "s"}`)
  return parts.join(" · ") || "No discounts set"
}

export default function FlashSalesPage() {
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [deleting, setDeleting] = useState<any>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    fetchSales()
  }, [])

  const fetchSales = async () => {
    const res = await fetch("/api/marketing/flash-sales")
    const data = await res.json()
    setSales(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const openForm = (sale: any = null) => {
    setEditing(sale)
    setOpen(true)
  }

  const handleSaved = async () => {
    setOpen(false)
    setEditing(null)
    await fetchSales()
  }

  const toggleActive = async (sale: any, active: boolean) => {
    setBusyId(sale.id)
    // Optimistic: flip immediately, roll back if the request fails
    setSales((prev) => prev.map((s) => (s.id === sale.id ? { ...s, active } : s)))
    const res = await fetch("/api/marketing/flash-sales", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: sale.id, active }),
    })
    if (res.ok) {
      toast({ title: active ? `"${sale.name}" activated` : `"${sale.name}" deactivated` })
    } else {
      setSales((prev) => prev.map((s) => (s.id === sale.id ? { ...s, active: !active } : s)))
      toast({ title: "Couldn't update flash sale", variant: "destructive" })
    }
    setBusyId(null)
  }

  const confirmDelete = async () => {
    if (!deleting) return
    const sale = deleting
    setDeleting(null)
    setBusyId(sale.id)
    const res = await fetch(`/api/marketing/flash-sales?id=${encodeURIComponent(sale.id)}`, { method: "DELETE" })
    if (res.ok) {
      setSales((prev) => prev.filter((s) => s.id !== sale.id))
      toast({ title: `"${sale.name}" deleted` })
    } else {
      toast({ title: "Couldn't delete flash sale", variant: "destructive" })
    }
    setBusyId(null)
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-serif">Flash Sales</h1>
        <Button onClick={() => openForm()}>Add Flash Sale</Button>
      </div>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setEditing(null)
        }}
      >
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Flash Sale</DialogTitle></DialogHeader>
          <FlashSaleForm key={editing?.id ?? "new"} sale={editing} onSave={handleSaved} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(next) => !next && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{deleting?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the flash sale and its discounts. Prices go back to normal immediately.
              To pause it instead, switch it off.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {sales.length === 0 ? (
        <p className="py-12 text-center text-gray-500">No flash sales yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Discounts</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((s) => {
              const status = getStatus(s)
              return (
                <TableRow key={s.id} className={cn(!s.active && "opacity-60")}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {describeDiscounts(s)}
                    {typeof s.productsReached === "number" && (
                      <span className={cn("block text-xs", s.productsReached === 0 ? "text-red-600" : "text-gray-400")}>
                        Applies to {s.productsReached} published product{s.productsReached === 1 ? "" : "s"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {format(new Date(s.startsAt), "dd/MM/yyyy HH:mm")} – {format(new Date(s.endsAt), "dd/MM/yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", statusStyles[status])}>
                      {status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={s.active}
                      disabled={busyId === s.id}
                      onCheckedChange={(checked) => toggleActive(s, checked)}
                      aria-label={s.active ? "Deactivate flash sale" : "Activate flash sale"}
                    />
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="sm" onClick={() => openForm(s)}>
                      <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={busyId === s.id}
                      onClick={() => setDeleting(s)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
