"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Package, ShoppingBag, Users, Box } from "lucide-react"

const navItems = [
  { name: "Inventory Lookup", href: "/cs/inventory", icon: Box },
  { name: "Product Search", href: "/cs/products", icon: Package },
  { name: "Order Search", href: "/cs/orders", icon: ShoppingBag },
  { name: "Customer Lookup", href: "/cs/customers", icon: Users },
]

export default function CSNav() {
  const pathname = usePathname()
  return (
    <aside className="w-64 border-r bg-gray-50">
      <div className="p-4 font-bold text-lg">Customer Service</div>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100", pathname === item.href && "bg-gray-100 font-medium")}>
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  )
}