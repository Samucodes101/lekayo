"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { Star } from "lucide-react"

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ customerName: "", review: "", rating: 5, photo: "", approved: false, order: 0 })

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    const res = await fetch("/api/cms/testimonials")
    const data = await res.json()
    setTestimonials(data)
    setLoading(false)
  }

  const handleSubmit = async () => {
    const res = await fetch("/api/cms/testimonials", {
      method: editing ? "PUT" : "POST",
      body: JSON.stringify(editing ? { ...form, id: editing.id } : form),
      headers: { "Content-Type": "application/json" },
    })
    if (res.ok) {
      toast({ title: "Testimonial saved" })
      setOpen(false)
      fetchTestimonials()
      setForm({ customerName: "", review: "", rating: 5, photo: "", approved: false, order: 0 })
      setEditing(null)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-serif">Testimonials</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button>Add Testimonial</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Testimonial</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Customer Name</Label><Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} /></div>
              <div><Label>Review</Label><Textarea value={form.review} onChange={(e) => setForm({ ...form, review: e.target.value })} /></div>
              <div><Label>Rating (1-5)</Label><Input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} /></div>
              <div><Label>Photo URL</Label><Input value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} /></div>
              <div className="flex items-center gap-2">
                <Label>Approved</Label>
                <Switch checked={form.approved} onCheckedChange={(v) => setForm({ ...form, approved: v })} />
              </div>
              <div><Label>Order</Label><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} /></div>
              <Button onClick={handleSubmit} className="w-full">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow><TableHead>Customer</TableHead><TableHead>Review</TableHead><TableHead>Rating</TableHead><TableHead>Approved</TableHead><TableHead></TableHead></TableRow>
        </TableHeader>
        <TableBody>
          {testimonials.map((t) => (
            <TableRow key={t.id}>
              <TableCell>{t.customerName}</TableCell>
              <TableCell className="max-w-xs truncate">{t.review}</TableCell>
              <TableCell>{t.rating} <Star className="inline h-3 w-3 fill-yellow-400" /></TableCell>
              <TableCell>{t.approved ? "✓" : "-"}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => { setEditing(t); setForm(t); setOpen(true) }}>Edit</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}