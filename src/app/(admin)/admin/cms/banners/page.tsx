"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"

export default function BannersPage() {
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ image: "", link: "", position: "MIDDLE", active: true, order: 0 })

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    const res = await fetch("/api/cms/banners")
    const data = await res.json()
    setBanners(data)
    setLoading(false)
  }

  const handleSubmit = async () => {
    const res = await fetch("/api/cms/banners", {
      method: editing ? "PUT" : "POST",
      body: JSON.stringify(editing ? { ...form, id: editing.id } : form),
      headers: { "Content-Type": "application/json" },
    })
    if (res.ok) {
      toast({ title: "Banner saved" })
      setOpen(false)
      fetchBanners()
      setForm({ image: "", link: "", position: "MIDDLE", active: true, order: 0 })
      setEditing(null)
    } else {
      toast({ title: "Error", variant: "destructive" })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) return
    const res = await fetch(`/api/cms/banners?id=${id}`, { method: "DELETE" })
    if (res.ok) {
      toast({ title: "Banner deleted" })
      fetchBanners()
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-serif">Promotional Banners</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); setForm({ image: "", link: "", position: "MIDDLE", active: true, order: 0 }) }}>
              Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Banner</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Image URL</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
              <div><Label>Link (optional)</Label><Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} /></div>
              <div><Label>Position</Label>
                <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="w-full border rounded p-2">
                  <option value="TOP">Top</option>
                  <option value="MIDDLE">Middle</option>
                  <option value="BOTTOM">Bottom</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Label>Active</Label>
                <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
              </div>
              <div><Label>Order</Label><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} /></div>
              <Button onClick={handleSubmit} className="w-full">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow><TableHead>Image</TableHead><TableHead>Link</TableHead><TableHead>Position</TableHead><TableHead>Active</TableHead><TableHead></TableHead></TableRow>
        </TableHeader>
        <TableBody>
          {banners.map((b) => (
            <TableRow key={b.id}>
              <TableCell>
                {b.image && <Image src={b.image} alt="" width={60} height={40} className="object-cover rounded" />}
              </TableCell>
              <TableCell>{b.link || "-"}</TableCell>
              <TableCell>{b.position}</TableCell>
              <TableCell>{b.active ? "✓" : "-"}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => { setEditing(b); setForm(b); setOpen(true) }}>Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(b.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}