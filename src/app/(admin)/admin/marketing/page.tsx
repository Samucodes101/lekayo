import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Percent, Zap, Sparkles } from "lucide-react"

export default function MarketingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif">Marketing</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Percent className="h-5 w-5" /> Coupons</CardTitle>
            <CardDescription>Create and manage discount codes</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline"><Link href="/admin/marketing/coupons">Manage Coupons</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" /> Flash Sales</CardTitle>
            <CardDescription>Create time-limited promotions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline"><Link href="/admin/marketing/flash-sales">Manage Flash Sales</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5" /> Featured Products</CardTitle>
            <CardDescription>Mark products as featured</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline"><Link href="/admin/products?filter=featured">Manage Featured</Link></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}