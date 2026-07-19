"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"

export default function ColorsPage() {
  const [colors, setColors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: "", hexCode: "#000000" })

  useEffect(() => {
    fetchColors()
  }, [])

  const fetchColors = async () => {
    const res = await fetch("/api/colors")
    const data = await res.json()
    setColors(data)
    setLoading(false)
  }

  const handleSubmit = async () => {
    const res = await fetch("/api/colors", {
      method: editing ? "PUT" : "POST",
      body: JSON.stringify(editing ? { ...form, id: editing.id } : form),
      headers: { "Content-Type": "application/json" },
    })
    if (res.ok) {
      toast({ title: "Color saved" })
      setOpen(false)
      fetchColors()
      setForm({ name: "", hexCode: "#000000" })
      setEditing(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this color?")) return
    const res = await fetch(`/api/colors?id=${id}`, { method: "DELETE" })
    if (res.ok) {
      toast({ title: "Color deleted" })
      fetchColors()
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-serif">Colors</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Color</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Color</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Color</Label>
                <div className="flex items-center gap-2">
                  <Input type="color" value={form.hexCode} onChange={(e) => setForm({ ...form, hexCode: e.target.value })} className="w-20 h-12 p-1" />
                  <Input value={form.hexCode} onChange={(e) => setForm({ ...form, hexCode: e.target.value })} className="flex-1" />
                </div>
              </div>
              <Button onClick={handleSubmit} className="w-full">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow><TableHead>Name</TableHead><TableHead>Swatch</TableHead><TableHead>Hex</TableHead><TableHead></TableHead></TableRow>
        </TableHeader>
        <TableBody>
          {colors.map((c) => (
            <TableRow key={c.id}>
              <TableCell>{c.name}</TableCell>
              <TableCell><div className="w-8 h-8 rounded-full border" style={{ backgroundColor: c.hexCode }} /></TableCell>
              <TableCell>{c.hexCode}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => { setEditing(c); setForm({ name: c.name, hexCode: c.hexCode }); setOpen(true) }}>Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(c.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}