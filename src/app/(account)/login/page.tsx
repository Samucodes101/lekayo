"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await signIn("credentials", { email, password, redirect: false })
    if (res?.error) {
      toast({ title: "Login failed", description: res.error, variant: "destructive" })
    } else {
      router.push("/account/profile")
    }
    setLoading(false)
  }

  return (
    <div className="container max-w-md mx-auto py-16">
      <h1 className="text-2xl font-serif mb-6 text-center">Sign In</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label>Password</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>Sign In</Button>
      </form>
      <p className="text-center text-sm mt-4">Don't have an account? <Link href="/register" className="underline">Register</Link></p>
      <p className="text-center text-sm mt-2"><Link href="/forgot-password" className="underline">Forgot password?</Link></p>
    </div>
  )
}