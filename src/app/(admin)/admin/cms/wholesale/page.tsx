"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"

export default function WholesalePage() {
  const [content, setContent] = useState({ description: "", telegramLink: "", requirements: "" })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    const res = await fetch("/api/cms/wholesale")
    const data = await res.json()
    setContent(data)
    setLoading(false)
  }

  const handleSave = async () => {
    const res = await fetch("/api/cms/wholesale", {
      method: "PUT",
      body: JSON.stringify(content),
      headers: { "Content-Type": "application/json" },
    })
    if (res.ok) {
      toast({ title: "Wholesale content updated" })
    } else {
      toast({ title: "Error", variant: "destructive" })
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif">Wholesale Page Content</h1>
      <div className="space-y-4 max-w-2xl">
        <div><Label>Description</Label><Textarea value={content.description} onChange={(e) => setContent({ ...content, description: e.target.value })} rows={6} /></div>
        <div><Label>Telegram Link</Label><Input value={content.telegramLink} onChange={(e) => setContent({ ...content, telegramLink: e.target.value })} /></div>
        <div><Label>Requirements</Label><Textarea value={content.requirements} onChange={(e) => setContent({ ...content, requirements: e.target.value })} rows={4} /></div>
        <Button onClick={handleSave}>Save Content</Button>
      </div>
    </div>
  )
}