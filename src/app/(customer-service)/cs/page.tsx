import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Package, ShoppingBag, Users, Box } from "lucide-react"

export default async function CustomerServiceDashboard() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")
  const role = session.user.role
  if (!["CUSTOMER_SERVICE", "ADMIN", "SUPER_ADMIN"].includes(role)) {
    redirect("/")
  }

  const cards = [
    { title: "Inventory Lookup", description: "Search product stock", href: "/cs/inventory", icon: Box },
    { title: "Product Search", description: "Find products by name/SKU", href: "/cs/products", icon: Package },
    { title: "Order Search", description: "Lookup orders by number", href: "/cs/orders", icon: ShoppingBag },
    { title: "Customer Lookup", description: "Find customers", href: "/cs/customers", icon: Users },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif">Customer Service Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="hover:shadow-lg transition">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <card.icon className="h-5 w-5" />
                  {card.title}
                </CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}