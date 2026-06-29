"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"

export default function GalleryPage() {
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ image: "", link: "", altText: "", order: 0 })

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    const res = await fetch("/api/cms/gallery")
    const data = await res.json()
    setImages(data)
    setLoading(false)
  }

  const handleSubmit = async () => {
    const res = await fetch("/api/cms/gallery", {
      method: editing ? "PUT" : "POST",
      body: JSON.stringify(editing ? { ...form, id: editing.id } : form),
      headers: { "Content-Type": "application/json" },
    })
    if (res.ok) {
      toast({ title: "Image saved" })
      setOpen(false)
      fetchImages()
      setForm({ image: "", link: "", altText: "", order: 0 })
      setEditing(null)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-serif">Gallery Images</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button>Add Image</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Image</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Image URL</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
              <div><Label>Link (optional)</Label><Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} /></div>
              <div><Label>Alt Text</Label><Input value={form.altText} onChange={(e) => setForm({ ...form, altText: e.target.value })} /></div>
              <div><Label>Order</Label><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} /></div>
              <Button onClick={handleSubmit} className="w-full">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((img) => (
          <div key={img.id} className="relative group">
            <Image src={img.image} alt={img.altText || ""} width={200} height={200} className="object-cover rounded aspect-square" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => { setEditing(img); setForm(img); setOpen(true) }}>Edit</Button>
              <Button variant="destructive" size="sm" onClick={async () => {
                await fetch(`/api/cms/gallery?id=${img.id}`, { method: "DELETE" })
                fetchImages()
              }}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}