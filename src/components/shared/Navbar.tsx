"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useCartStore } from "@/stores/cartStore"
import { useWishlistStore } from "@/stores/wishlistStore"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Menu, ShoppingBag, Heart, Search, User, 
  LayoutDashboard, Package, Megaphone, Users, Terminal, LogOut,
  ChevronDown
} from "lucide-react"
import { cn } from "@/lib/utils"

// This will be populated from the database
interface Category {
  id: string
  name: string
  slug: string
  subcategories: { id: string; name: string; slug: string }[]
}

interface NavbarProps {
  categories?: Category[]
}

export default function Navbar({ categories = [] }: NavbarProps) {
  const { data: session } = useSession()
  const cartItems = useCartStore((state) => state.items)
  const wishlistItems = useWishlistStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)
  const clearWishlist = useWishlistStore((state) => state.clearWishlist)
  const [scrolled, setScrolled] = useState(false)
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)
  const wishlistCount = wishlistItems.length

  const handleSignOut = () => {
    clearCart()
    clearWishlist()
    signOut({ callbackUrl: "/" })
  }

const role = session?.user?.role as string
let dashboardLink = null
if (role === "SUPER_ADMIN" || role === "ADMIN") {
  dashboardLink = { href: "/admin", label: "Admin Dashboard", icon: LayoutDashboard }
} else if (role === "CUSTOMER_SERVICE") {
  dashboardLink = { href: "/cs", label: "Customer Service", icon: Users }
} else if (role === "INVENTORY_MANAGER") {
  dashboardLink = { href: "/admin/inventory", label: "Inventory", icon: Package }
} else if (role === "MARKETING_MANAGER") {
  dashboardLink = { href: "/admin/marketing", label: "Marketing", icon: Megaphone }
} else if (role === "DEVELOPER") {
  dashboardLink = { href: "/dev", label: "Developer", icon: Terminal }
}

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop", hasDropdown: true },
    { name: "Brands", href: "/brands" },
    { name: "Wholesale", href: "/wholesale" },
  ]

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled ? "bg-white/95 backdrop-blur shadow-sm" : "bg-white"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="text-2xl font-serif font-bold tracking-tight shrink-0">
          LEKAYO
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <div key={link.href} className="relative group">
              {link.hasDropdown ? (
                <>
                  <button
                    onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                    className="text-sm font-medium hover:text-gray-600 transition flex items-center gap-1"
                  >
                    Shop
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  {/* Mega Menu Dropdown */}
                  {megaMenuOpen && categories.length > 0 && (
                    <div 
                      className="absolute left-0 top-full mt-2 w-screen max-w-6xl -translate-x-1/3 bg-white shadow-xl rounded-lg p-6 grid grid-cols-4 gap-6 border"
                      onMouseLeave={() => setMegaMenuOpen(false)}
                    >
                      {categories.map((category) => (
                        <div key={category.id}>
                          <Link
                            href={`/shop/${category.slug}`}
                            className="font-semibold text-sm hover:text-gray-600 block mb-2"
                          >
                            {category.name}
                          </Link>
                          <ul className="space-y-1">
                            {category.subcategories.map((sub) => (
                              <li key={sub.id}>
                                <Link
                                  href={`/shop/${category.slug}/${sub.slug}`}
                                  className="text-sm text-gray-600 hover:text-black transition"
                                >
                                  {sub.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link href={link.href} className="text-sm font-medium hover:text-gray-600 transition">
                  {link.name}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Icons & User Menu */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/search"><Search className="h-5 w-5" /></Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/account/wishlist">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/cart">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-black text-[10px] text-white flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/account/profile">Profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/account/orders">Orders</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/account/wishlist">Wishlist</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/account/addresses">Addresses</Link></DropdownMenuItem>
                {dashboardLink && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={dashboardLink.href} className="flex items-center gap-2">
                        <dashboardLink.icon className="h-4 w-4" />
                        {dashboardLink.label}
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Sign In</Link>
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="text-lg font-medium">
                    {link.name}
                  </Link>
                ))}
                {dashboardLink && (
                  <Link href={dashboardLink.href} className="text-lg font-medium flex items-center gap-2">
                    <dashboardLink.icon className="h-4 w-4" />
                    {dashboardLink.label}
                  </Link>
                )}
                <hr />
                {session ? (
                  <button onClick={handleSignOut} className="text-left text-lg font-medium text-red-600">
                    Sign Out
                  </button>
                ) : (
                  <Link href="/login" className="text-lg font-medium">Sign In</Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}