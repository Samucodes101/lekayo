"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"

export default function ImpersonatePage() {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("CUSTOMER")

  const handleImpersonate = async () => {
    const res = await fetch("/api/dev/impersonate", {
      method: "POST",
      body: JSON.stringify({ email, role }),
      headers: { "Content-Type": "application/json" },
    })
    if (res.ok) {
      toast({ title: "Impersonating user", description: "Refresh to see changes" })
    } else {
      toast({ title: "Error", description: "User not found", variant: "destructive" })
    }
  }

  const handleSwitchRole = async () => {
    const res = await fetch("/api/dev/switch-role", {
      method: "POST",
      body: JSON.stringify({ role }),
      headers: { "Content-Type": "application/json" },
    })
    if (res.ok) {
      toast({ title: `Switched to ${role}` })
    } else {
      toast({ title: "Error", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif">Impersonate</h1>
      <Card>
        <CardHeader><CardTitle>Impersonate User</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">User Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
          </div>
          <Button onClick={handleImpersonate}>Impersonate</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Switch Role View</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full border rounded p-2">
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
              <option value="CUSTOMER_SERVICE">Customer Service</option>
              <option value="INVENTORY_MANAGER">Inventory Manager</option>
              <option value="MARKETING_MANAGER">Marketing Manager</option>
              <option value="CUSTOMER">Customer</option>
              <option value="DEVELOPER">Developer</option>
            </select>
          </div>
          <Button onClick={handleSwitchRole}>Switch Role View</Button>
        </CardContent>
      </Card>
    </div>
  )
}