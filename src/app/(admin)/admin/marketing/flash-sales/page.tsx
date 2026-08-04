"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { format } from "date-fns"
import FlashSaleForm from "@/components/marketing/FlashSaleForm"

export default function FlashSalesPage() {
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)

  useEffect(() => {
    fetchSales()
  }, [])

  const fetchSales = async () => {
    const res = await fetch("/api/marketing/flash-sales")
    const data = await res.json()
    setSales(data)
    setLoading(false)
  }

  const handleSaved = async () => {
    setOpen(false)
    setEditing(null)
    await fetchSales()
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-serif">Flash Sales</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button>Add Flash Sale</Button></DialogTrigger>
          <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Flash Sale</DialogTitle></DialogHeader>
              <FlashSaleForm sale={editing} onSave={handleSaved} />
            </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow><TableHead>Name</TableHead><TableHead>Period</TableHead><TableHead>Active</TableHead><TableHead></TableHead></TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((s) => (
            <TableRow key={s.id}>
              <TableCell>{s.name}</TableCell>
              <TableCell>{format(new Date(s.startsAt), "dd/MM/yyyy")} - {format(new Date(s.endsAt), "dd/MM/yyyy")}</TableCell>
              <TableCell>{s.active ? "✓" : "-"}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => { setEditing(s); setOpen(true) }}>Edit</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}