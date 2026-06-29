"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"

export default function ReportsPage() {
  const [reportType, setReportType] = useState("sales")
  const [format, setFormat] = useState("csv")
  const [loading, setLoading] = useState(false)

  const generateReport = async () => {
    setLoading(true)
    const res = await fetch(`/api/reports/generate?type=${reportType}&format=${format}`)
    if (res.ok) {
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `lekayo-${reportType}-report.${format}`
      a.click()
      toast({ title: "Report downloaded" })
    } else {
      toast({ title: "Error generating report", variant: "destructive" })
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif">Reports</h1>
      <Card>
        <CardHeader><CardTitle>Generate Report</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Report Type</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="inventory">Inventory</SelectItem>
                <SelectItem value="customers">Customers</SelectItem>
                <SelectItem value="products">Products</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="activity">Activity</SelectItem>
                <SelectItem value="audit">Audit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Format</label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={generateReport} disabled={loading}>
            {loading ? "Generating..." : `Download ${reportType} Report`}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}