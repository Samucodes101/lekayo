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
  return (
    <aside className="w-64 border-r bg-gray-900 text-white">
      <div className="p-4 font-bold text-lg border-b border-gray-700">⚡ Developer</div>
      <nav className="space-y-1 p-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 px-4 py-2 text-sm rounded-md hover:bg-gray-800", pathname === item.href && "bg-gray-800 font-medium")}>
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  )
}