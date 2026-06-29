"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"

export default function HeroPage() {
  const [hero, setHero] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    headline: "",
    subheadline: "",
    ctaText: "",
    ctaLink: "",
    image: "",
    active: true,
    order: 0,
  })

  useEffect(() => {
    fetchHero()
  }, [])

  const fetchHero = async () => {
    const res = await fetch("/api/cms/hero")
    const data = await res.json()
    if (data) {
      setHero(data)
      setForm(data)
    }
    setLoading(false)
  }

  const handleSubmit = async () => {
    const res = await fetch("/api/cms/hero", {
      method: hero ? "PUT" : "POST",
      body: JSON.stringify(hero ? { ...form, id: hero.id } : form),
      headers: { "Content-Type": "application/json" },
    })
    if (res.ok) {
      toast({ title: "Hero banner saved" })
      fetchHero()
    } else {
      toast({ title: "Error", variant: "destructive" })
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif">Hero Banner</h1>
      <div className="space-y-4 max-w-2xl">
        <div><Label>Headline</Label><Input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} /></div>
        <div><Label>Subheadline</Label><Input value={form.subheadline} onChange={(e) => setForm({ ...form, subheadline: e.target.value })} /></div>
        <div><Label>CTA Text</Label><Input value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} /></div>
        <div><Label>CTA Link</Label><Input value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} /></div>
        <div><Label>Image URL</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
        <div className="flex items-center gap-2">
          <Label>Active</Label>
          <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
        </div>
        <div><Label>Order</Label><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} /></div>
        <Button onClick={handleSubmit}>Save Hero</Button>
      </div>
    </div>
  )
}