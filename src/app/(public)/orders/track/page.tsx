"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("")
  const [status, setStatus] = useState<string | null>(null)

  const handleTrack = async () => {
    const res = await fetch(`/api/orders/track?orderNumber=${orderNumber}`)
    const data = await res.json()
    setStatus(data.status)
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <h1 className="text-3xl font-serif mb-6 text-center">Track Your Order</h1>
      <div className="flex gap-2">
        <Input placeholder="Order number" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
        <Button onClick={handleTrack}>Track</Button>
      </div>
      {status && (
        <div className="mt-6 p-4 border rounded-lg">
          <p className="font-semibold">Status: {status}</p>
        </div>
      )}
    </div>
  )
}