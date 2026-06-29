"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { RevenueChart } from "@/components/admin/AnalyticsCharts"

export default function SalesAnalyticsPage() {
  const [period, setPeriod] = useState<"today" | "week" | "month" | "year">("month")

  // In a real implementation, fetch data based on period
  const mockData = [
    { date: "2026-06-01", revenue: 1200 },
    { date: "2026-06-02", revenue: 900 },
    { date: "2026-06-03", revenue: 1500 },
    { date: "2026-06-04", revenue: 2100 },
    { date: "2026-06-05", revenue: 1800 },
    { date: "2026-06-06", revenue: 2400 },
    { date: "2026-06-07", revenue: 3000 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif">Sales Analytics</h1>
        <div className="flex gap-2">
          <Button variant={period === "today" ? "default" : "outline"} size="sm" onClick={() => setPeriod("today")}>
            Today
          </Button>
          <Button variant={period === "week" ? "default" : "outline"} size="sm" onClick={() => setPeriod("week")}>
            Week
          </Button>
          <Button variant={period === "month" ? "default" : "outline"} size="sm" onClick={() => setPeriod("month")}>
            Month
          </Button>
          <Button variant={period === "year" ? "default" : "outline"} size="sm" onClick={() => setPeriod("year")}>
            Year
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader><CardTitle>Revenue</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatPrice(12900)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Orders</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">42</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>AOV</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatPrice(307.14)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Conversion Rate</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">3.2%</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Revenue Over Time</CardTitle></CardHeader>
        <CardContent>
          <RevenueChart data={mockData} />
        </CardContent>
      </Card>
    </div>
  )
}