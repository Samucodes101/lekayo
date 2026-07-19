"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SubcategoriesPage() {
  const { id } = useParams()
  const router = useRouter()
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [category, setCategory] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: "", slug: "", description: "" })

  useEffect(() => {
    fetchSubcategories()
    fetchCategory()
  }, [])

  const fetchCategory = async () => {
    const res = await fetch(`/api/categories/${id}`)
    const data = await res.json()
    setCategory(data)
  }

  const fetchSubcategories = async () => {
    const res = await fetch(`/api/categories/${id}/subcategories`)
    const data = await res.json()
    setSubcategories(data)
    setLoading(false)
  }

  const handleSubmit = async () => {
    const url = editing
      ? `/api/categories/${id}/subcategories`
      : `/api/categories/${id}/subcategories`

    const method = editing ? "PUT" : "POST"
    const body = editing ? { ...form, id: editing.id } : form

    const res = await fetch(url, {
      method,
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    })
    if (res.ok) {
      toast({ title: editing ? "Subcategory updated" : "Subcategory created" })
      setOpen(false)
      fetchSubcategories()
      setForm({ name: "", slug: "", description: "" })
      setEditing(null)
    } else {
      toast({ title: "Error", variant: "destructive" })
    }
  }

  const handleDelete = async (subcategoryId: string) => {
    if (!confirm("Delete this subcategory?")) return
    const res = await fetch(`/api/categories/${id}/subcategories?id=${subcategoryId}`, {
      method: "DELETE",
    })
    if (res.ok) {
      toast({ title: "Subcategory deleted" })
      fetchSubcategories()
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/categories")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h1 className="text-2xl font-serif">Subcategories for {category?.name}</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Subcategories</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Add Subcategory</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit" : "Add"} Subcategory</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <Button onClick={handleSubmit} className="w-full">Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subcategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500">
                    No subcategories yet. Click "Add Subcategory" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                subcategories.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.slug}</TableCell>
                    <TableCell>{s.description || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditing(s)
                            setForm({ name: s.name, slug: s.slug, description: s.description || "" })
                            setOpen(true)
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(s.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}