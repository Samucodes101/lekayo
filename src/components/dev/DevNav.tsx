import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, FileText, Users, Activity, Server, Database, BarChart } from "lucide-react"

const navItems = [
  { name: "Dashboard", href: "/dev", icon: LayoutDashboard },
  { name: "Logs", href: "/dev/logs", icon: FileText },
  { name: "Impersonate", href: "/dev/impersonate", icon: Users },
  { name: "Environment", href: "/dev/diagnostics/env", icon: Server },
  { name: "Database", href: "/dev/diagnostics/db", icon: Database },
  { name: "Performance", href: "/dev/performance", icon: BarChart },
]

export default function DevNav() {
  const pathname = usePathname()
  const links = navItems.map((item) => (
    <Link key={item.href} href={item.href} className={cn("flex min-h-11 items-center gap-3 rounded-md px-4 py-2 text-sm hover:bg-gray-800", pathname === item.href && "bg-gray-800 font-medium")}>
      <item.icon className="h-4 w-4" />
      {item.name}
    </Link>
  ))

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r bg-gray-900 text-white md:block">
        <div className="border-b border-gray-700 p-4 text-lg font-bold">⚡ Developer</div>
        <nav className="space-y-1 p-2">{links}</nav>
      </aside>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-700 bg-gray-900 px-4 py-3 text-white md:hidden">
        <span className="font-semibold">Developer</span>
        <Sheet>
          <SheetTrigger asChild><Button variant="outline" size="icon" aria-label="Open developer navigation" className="border-gray-600 bg-transparent text-white hover:bg-gray-800"><Menu className="h-5 w-5" /></Button></SheetTrigger>
          <SheetContent side="left" className="w-72 border-gray-700 bg-gray-900 p-0 text-white">
            <div className="border-b border-gray-700 p-4 text-lg font-bold">⚡ Developer</div>
            <nav className="space-y-1 p-2">{links}</nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}