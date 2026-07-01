"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

interface Section {
  id: string
  sectionType: string
  visible: boolean
  order: number
}

export function SectionReorder({ sections: initialSections, onReorder }: { sections: Section[]; onReorder: () => void }) {
  const [sections, setSections] = useState(initialSections)

  const moveSection = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= sections.length) return
    const items = Array.from(sections)
    const [reordered] = items.splice(fromIndex, 1)
    items.splice(toIndex, 0, reordered)
    setSections(items)
  }

  const handleSave = async () => {
    const payload = sections.map((s, idx) => ({ id: s.id, order: idx }))
    const res = await fetch("/api/cms/homepage-sections/reorder", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    })
    if (res.ok) {
      toast({ title: "Sections reordered" })
      onReorder()
    } else {
      toast({ title: "Error", variant: "destructive" })
    }
  }

  return (
    <div>
      <div className="space-y-2">
        {sections.map((section, idx) => (
          <div key={section.id} className="flex items-center gap-4 p-3 bg-white border rounded-md">
            <span className="flex-1 font-medium">{section.sectionType}</span>
            <span className="text-sm text-gray-500">{section.visible ? "Visible" : "Hidden"}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => moveSection(idx, idx - 1)} disabled={idx === 0}>
                ↑
              </Button>
              <Button variant="outline" size="sm" onClick={() => moveSection(idx, idx + 1)} disabled={idx === sections.length - 1}>
                ↓
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Button onClick={handleSave} className="mt-4">Save Order</Button>
    </div>
  )
}