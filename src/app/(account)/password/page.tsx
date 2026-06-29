"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"

export default function ChangePasswordPage() {
  const [current, setCurrent] = useState("")
  const [newPass, setNewPass] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPass !== confirm) {
      toast({ title: "Passwords do not match", variant: "destructive" })
      return
    }
    setLoading(true)
    const res = await fetch("/api/user/change-password", { method: "POST", body: JSON.stringify({ currentPassword: current, newPassword: newPass }), headers: { "Content-Type": "application/json" } })
    if (res.ok) {
      toast({ title: "Password updated" })
      setCurrent(""); setNewPass(""); setConfirm("")
    } else {
      toast({ title: "Error", description: "Invalid current password", variant: "destructive" })
    }
    setLoading(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-serif mb-6">Change Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div><Label>Current Password</Label><Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required /></div>
        <div><Label>New Password</Label><Input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} required /></div>
        <div><Label>Confirm New Password</Label><Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required /></div>
        <Button type="submit" disabled={loading}>Update Password</Button>
      </form>
    </div>
  )
}