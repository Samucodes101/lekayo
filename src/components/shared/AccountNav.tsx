"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Profile", href: "/account/profile" },
  { name: "Orders", href: "/account/orders" },
  { name: "Wishlist", href: "/account/wishlist" },
  { name: "Addresses", href: "/account/addresses" },
  { name: "Change Password", href: "/account/password" },
]

export default function AccountNav() {
  const pathname = usePathname()
  return (
    <nav className="space-y-2">
      {navItems.map((item) => (
        <Link key={item.href} href={item.href} className={cn("block px-4 py-2 rounded-md hover:bg-gray-100", pathname === item.href && "bg-gray-100 font-medium")}>
          {item.name}
        </Link>
      ))}
    </nav>
  )
}