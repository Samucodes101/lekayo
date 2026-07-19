"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ImageUpload } from "@/components/shared/ImageUpload"
import { toast } from "@/hooks/use-toast"

export default function EditorialPage() {
  const [blocks, setBlocks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ title: "", body: "", image: "", link: "", position: "FULL_WIDTH", active: true, order: 0 })

  useEffect(() => {
    fetchBlocks()
  }, [])

  const fetchBlocks = async () => {
    const res = await fetch("/api/cms/editorial")
    const data = await res.json()
    setBlocks(data)
    setLoading(false)
  }

  const handleSubmit = async () => {
    const res = await fetch("/api/cms/editorial", {
      method: editing ? "PUT" : "POST",
      body: JSON.stringify(editing ? { ...form, id: editing.id } : form),
      headers: { "Content-Type": "application/json" },
    })
    if (res.ok) {
      toast({ title: "Editorial block saved" })
      setOpen(false)
      fetchBlocks()
      setForm({ title: "", body: "", image: "", link: "", position: "FULL_WIDTH", active: true, order: 0 })
      setEditing(null)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-serif">Editorial Blocks</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button>Add Block</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Editorial Block</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Body</Label><Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
              <div>
                <Label>Image</Label>
                <ImageUpload
                  value={form.image}
                  onChange={(url) => setForm({ ...form, image: url })}
                  onRemove={() => setForm({ ...form, image: "" })}
                  folder="editorial"
                />
              </div>
              <div><Label>Link (optional)</Label><Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} /></div>
              <div><Label>Position</Label>
                <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="w-full border rounded p-2">
                  <option value="LEFT">Left</option>
                  <option value="RIGHT">Right</option>
                  <option value="FULL_WIDTH">Full Width</option>
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
        <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Position</TableHead><TableHead>Active</TableHead><TableHead></TableHead></TableRow></TableHeader>
        <TableBody>
          {blocks.map((b) => (
            <TableRow key={b.id}>
              <TableCell>{b.title}</TableCell>
              <TableCell>{b.position}</TableCell>
              <TableCell>{b.active ? "✓" : "-"}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => { setEditing(b); setForm(b); setOpen(true) }}>Edit</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}