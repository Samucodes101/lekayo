"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function PerformancePage() {
  const [metrics, setMetrics] = useState<any>(null)

  useEffect(() => {
    fetch("/api/dev/performance")
      .then((res) => res.json())
      .then((data) => setMetrics(data))
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif">Performance Monitoring</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle>Page Load Time</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{metrics?.pageLoad || "N/A"} ms</CardContent></Card>
        <Card><CardHeader><CardTitle>Memory Usage</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{metrics?.memory || "N/A"} MB</CardContent></Card>
        <Card><CardHeader><CardTitle>Active Users</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{metrics?.activeUsers || 0}</CardContent></Card>
      </div>
      <Button onClick={() => window.location.reload()}>Refresh Metrics</Button>
    </div>
  )
}