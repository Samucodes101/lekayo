"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"

export default function HomepageCMS() {
  const [sections, setSections] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/cms/homepage-sections")
      .then((res) => res.json())
      .then((data) => setSections(data))
  }, [])

  const moveSection = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= sections.length) return
    const updated = [...sections]
    const [moved] = updated.splice(fromIndex, 1)
    updated.splice(toIndex, 0, moved)
    setSections(updated)
  }

  const handleReorder = async () => {
    const payload = sections.map((s, idx) => ({ id: s.id, order: idx }))
    const res = await fetch("/api/cms/homepage-sections/reorder", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    })
    if (res.ok) {
      toast({ title: "Sections reordered" })
    } else {
      toast({ title: "Error", variant: "destructive" })
    }
  }

  const toggleVisibility = async (id: string, visible: boolean) => {
    const res = await fetch("/api/cms/homepage-sections", {
      method: "PUT",
      body: JSON.stringify({ id, visible }),
      headers: { "Content-Type": "application/json" },
    })
    if (res.ok) {
      setSections(sections.map((s) => (s.id === id ? { ...s, visible } : s)))
      toast({ title: "Section updated" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif">Homepage Sections</h1>
        <Button onClick={handleReorder}>Save Order</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Section</TableHead>
            <TableHead>Visible</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sections.map((section, idx) => (
            <TableRow key={section.id}>
              <TableCell>{idx + 1}</TableCell>
              <TableCell>{section.sectionType}</TableCell>
              <TableCell>
                <Switch checked={section.visible} onCheckedChange={(v) => toggleVisibility(section.id, v)} />
              </TableCell>
              <TableCell className="space-x-2">
                <Button variant="outline" size="sm" onClick={() => moveSection(idx, idx - 1)} disabled={idx === 0}>
                  ↑
                </Button>
                <Button variant="outline" size="sm" onClick={() => moveSection(idx, idx + 1)} disabled={idx === sections.length - 1}>
                  ↓
                </Button>
                <Button variant="outline" size="sm">Edit</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}