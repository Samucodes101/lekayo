"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"

export default function HomepageCMS() {
  const [sections, setSections] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/cms/homepage-sections")
      .then((res) => res.json())
      .then((data) => setSections(data))
  }, [])

  const handleDragEnd = (result: any) => {
    if (!result.destination) return
    const items = Array.from(sections)
    const [reordered] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reordered)
    setSections(items)
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

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Visible</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sections.map((section, idx) => (
                    <Draggable key={section.id} draggableId={section.id} index={idx}>
                      {(provided) => (
                        <TableRow ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell>{section.sectionType}</TableCell>
                          <TableCell>
                            <Switch checked={section.visible} onCheckedChange={(v) => toggleVisibility(section.id, v)} />
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">Edit</Button>
                          </TableCell>
                        </TableRow>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </TableBody>
              </Table>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}