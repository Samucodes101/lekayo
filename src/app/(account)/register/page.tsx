"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch("/api/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }), headers: { "Content-Type": "application/json" } })
    if (res.ok) {
      toast({ title: "Account created", description: "Please sign in." })
      router.push("/login")
    } else {
      const error = await res.text()
      toast({ title: "Error", description: error, variant: "destructive" })
    }
    setLoading(false)
  }

  return (
    <div className="container max-w-md mx-auto py-16">
      <h1 className="text-2xl font-serif mb-6 text-center">Create Account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><Label>Full Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
        <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        <Button type="submit" className="w-full" disabled={loading}>Register</Button>
      </form>
      <p className="text-center text-sm mt-4">Already have an account? <Link href="/login" className="underline">Sign In</Link></p>
    </div>
  )
}