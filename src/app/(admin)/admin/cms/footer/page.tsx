"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"

export default function FooterPage() {
  const [footer, setFooter] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFooter()
  }, [])

  const fetchFooter = async () => {
    const res = await fetch("/api/cms/footer")
    const data = await res.json()
    setFooter(data || {})
    setLoading(false)
  }

  const handleSave = async () => {
    const res = await fetch("/api/cms/footer", {
      method: "PUT",
      body: JSON.stringify(footer),
      headers: { "Content-Type": "application/json" },
    })
    if (res.ok) {
      toast({ title: "Footer updated" })
    } else {
      toast({ title: "Error", variant: "destructive" })
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif">Footer Content</h1>
      <div className="space-y-4">
        <div>
          <Label>Social Links (JSON)</Label>
          <Input
            value={JSON.stringify(footer.socialLinks || {})}
            onChange={(e) => setFooter({ ...footer, socialLinks: JSON.parse(e.target.value || "{}") })}
            className="font-mono text-sm"
          />
        </div>
        <div>
          <Label>Footer Links (JSON)</Label>
          <Input
            value={JSON.stringify(footer.links || {})}
            onChange={(e) => setFooter({ ...footer, links: JSON.parse(e.target.value || "{}") })}
            className="font-mono text-sm"
          />
        </div>
        <div>
          <Label>Copyright Text</Label>
          <Input value={footer.copyright || ""} onChange={(e) => setFooter({ ...footer, copyright: e.target.value })} />
        </div>
        <Button onClick={handleSave}>Save Footer</Button>
      </div>
    </div>
  )
}