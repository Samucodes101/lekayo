"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [valid, setValid] = useState<boolean | null>(null)

  useEffect(() => {
    const t = searchParams.get("token")
    if (t) {
      setToken(t)
      // Validate token
      fetch(`/api/auth/verify-reset-token?token=${t}`)
        .then(res => res.json())
        .then(data => setValid(data.valid))
        .catch(() => setValid(false))
    } else {
      setValid(false)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      toast({ title: "Passwords do not match", variant: "destructive" })
      return
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" })
      return
    }
    setLoading(true)
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
      headers: { "Content-Type": "application/json" },
    })
    if (res.ok) {
      toast({ title: "Password reset successfully" })
      router.push("/login")
    } else {
      const error = await res.text()
      toast({ title: "Error", description: error, variant: "destructive" })
    }
    setLoading(false)
  }

  if (valid === null) return <div>Loading...</div>
  if (valid === false) return <div>Invalid or expired reset link.</div>

  return (
    <div className="container max-w-md mx-auto py-16">
      <Card>
        <CardHeader><CardTitle>Reset Password</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>New Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div>
              <Label>Confirm Password</Label>
              <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}