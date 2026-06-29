"use client"

import { useState } from "react"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { Button } from "@/components/ui/button"
import { GripVertical } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Section {
  id: string
  sectionType: string
  visible: boolean
  order: number
}

export function SectionReorder({ sections: initialSections, onReorder }: { sections: Section[]; onReorder: () => void }) {
  const [sections, setSections] = useState(initialSections)

  const handleDragEnd = (result: any) => {
    if (!result.destination) return
    const items = Array.from(sections)
    const [reordered] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reordered)
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
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
              {sections.map((section, idx) => (
                <Draggable key={section.id} draggableId={section.id} index={idx}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} className="flex items-center gap-4 p-3 bg-white border rounded-md">
                      <div {...provided.dragHandleProps}><GripVertical className="h-5 w-5 text-gray-400" /></div>
                      <span className="flex-1 font-medium">{section.sectionType}</span>
                      <span className="text-sm text-gray-500">{section.visible ? "Visible" : "Hidden"}</span>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <Button onClick={handleSave} className="mt-4">Save Order</Button>
    </div>
  )
}