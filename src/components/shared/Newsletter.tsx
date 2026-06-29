"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"

export default function Newsletter() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch("/api/newsletter", { method: "POST", body: JSON.stringify({ email }), headers: { "Content-Type": "application/json" } })
    if (res.ok) {
      toast({ title: "Subscribed!", description: "Thank you for joining Lekayo Club." })
      setEmail("")
    } else {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" })
    }
    setLoading(false)
  }

  return (
    <section className="container mx-auto py-16 text-center">
      <h2 className="text-3xl font-serif mb-2">Join The Lekayo Club</h2>
      <p className="text-gray-600 mb-6">Be the first to know about new arrivals, exclusive offers, and style inspiration.</p>
      <form onSubmit={handleSubmit} className="flex max-w-md mx-auto gap-2">
        <Input type="email" placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} required className="flex-1" />
        <Button type="submit" disabled={loading}>Subscribe</Button>
      </form>
    </section>
  )
}