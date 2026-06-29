"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: "Lekayo",
    siteDescription: "Luxury fashion destination",
    contactEmail: "",
    contactPhone: "",
    address: "",
    shippingRate: 0,
    taxRate: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings(data)
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    const res = await fetch("/api/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
      headers: { "Content-Type": "application/json" },
    })
    if (res.ok) {
      toast({ title: "Settings saved" })
    } else {
      toast({ title: "Error", variant: "destructive" })
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif">Settings</h1>
      <Card>
        <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Site Name</Label><Input value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} /></div>
          <div><Label>Site Description</Label><Input value={settings.siteDescription} onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })} /></div>
          <div><Label>Contact Email</Label><Input type="email" value={settings.contactEmail} onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })} /></div>
          <div><Label>Contact Phone</Label><Input value={settings.contactPhone} onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })} /></div>
          <div><Label>Address</Label><Input value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} /></div>
          <div><Label>Shipping Rate ($)</Label><Input type="number" step="0.01" value={settings.shippingRate} onChange={(e) => setSettings({ ...settings, shippingRate: Number(e.target.value) })} /></div>
          <div><Label>Tax Rate (%)</Label><Input type="number" step="0.01" value={settings.taxRate} onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })} /></div>
          <Button onClick={handleSave}>Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  )
}