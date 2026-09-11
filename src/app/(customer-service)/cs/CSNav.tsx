"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Package, ShoppingBag, Users, Box } from "lucide-react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navItems = [
  { name: "Inventory Lookup", href: "/cs/inventory", icon: Box },
  { name: "Product Search", href: "/cs/products", icon: Package },
  { name: "Order Search", href: "/cs/orders", icon: ShoppingBag },
  { name: "New Walk-in Order", href: "/cs/orders/new", icon: ShoppingBag },
  { name: "Customer Lookup", href: "/cs/customers", icon: Users },
]

export default function CSNav() {
  const pathname = usePathname()
  const links = navItems.map((item) => (
    <Link key={item.href} href={item.href} className={cn("flex min-h-11 items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100", pathname === item.href && "bg-gray-100 font-medium")}>
      <item.icon className="h-4 w-4" />
      {item.name}
    </Link>
  ))

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r bg-gray-50 md:block">
        <div className="p-4 text-lg font-bold">Customer Service</div>
        <nav className="space-y-1">{links}</nav>
      </aside>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b bg-gray-50 px-4 py-3 md:hidden">
        <span className="font-semibold">Customer Service</span>
        <Sheet>
          <SheetTrigger asChild><Button variant="outline" size="icon" aria-label="Open customer service navigation"><Menu className="h-5 w-5" /></Button></SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <div className="border-b p-4 text-lg font-bold">Customer Service</div>
            <nav className="space-y-1 py-2">{links}</nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}