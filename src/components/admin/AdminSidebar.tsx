"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Palette, Package, ShoppingBag, Users, BarChart3, Megaphone, Settings, FileText, Activity, LogOut } from "lucide-react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Colors", href: "/admin/colors", icon: Palette },
  { name: "Categories", href: "/admin/categories", icon: ShoppingBag },
  { name: "Brands", href: "/admin/brands", icon: Package },
  { name: "Inventory", href: "/admin/inventory", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Marketing", href: "/admin/marketing", icon: Megaphone },
  { name: "CMS", href: "/admin/cms", icon: FileText },
  { name: "Users & Roles", href: "/admin/users", icon: Users },
  { name: "Audit Logs", href: "/admin/audit-logs", icon: Activity },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export default function AdminSidebar() {
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
        <div className="p-4 text-xl font-bold">Lekayo Admin</div>
        <nav className="space-y-1">{links}</nav>
      </aside>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b bg-gray-50 px-4 py-3 md:hidden">
        <span className="font-semibold">Lekayo Admin</span>
        <Sheet>
          <SheetTrigger asChild><Button variant="outline" size="icon" aria-label="Open admin navigation"><Menu className="h-5 w-5" /></Button></SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <div className="border-b p-4 text-xl font-bold">Lekayo Admin</div>
            <nav className="space-y-1 py-2">{links}</nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}