"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useCartStore } from "@/stores/cartStore"
import { useGuestCartStore } from "@/stores/guestCartStore"
import { useWishlistStore } from "@/stores/wishlistStore"
import { useActiveCart } from "@/hooks/useActiveCart"
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
import Image from "next/image"

interface Category {
  id: string
  name: string
  slug: string
  subcategories: { id: string; name: string; slug: string }[]
}

interface Brand {
  id: string
  name: string
  slug: string
}

interface NavbarProps {
  categories?: Category[]
  brands?: Brand[]
}

export default function Navbar({ categories = [], brands = [] }: NavbarProps) {
  const { data: session } = useSession()
  const { items: cartItems } = useActiveCart()
  const wishlistItems = useWishlistStore((state) => state.items)
  const clearWishlist = useWishlistStore((state) => state.clearWishlist)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)
  const wishlistCount = wishlistItems.length

  const handleSignOut = () => {
    // Clear both auth and guest cart stores to ensure client-side state is reset
    useCartStore.getState().clearCart()
    useGuestCartStore.getState().clear()
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

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled ? "bg-white/95 backdrop-blur shadow-sm" : "bg-white"
      )}
    >
      <div className="flex h-16 items-center justify-between px-8 lg:px-16">
        {/* Logo */}
        <Link href="/" className="tracking-tight shrink-0">
          <Image src="/lekayoLogo.png" alt="Lekayo" width={80} height={40} priority />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium hover:text-gray-600 transition">
            Home
          </Link>

          {/* Shop — wide mega menu, opens on hover */}
          <div className="relative group/shop">
            <button className="text-sm font-medium hover:text-gray-600 transition flex items-center gap-1 py-6">
              Shop
              <ChevronDown className="h-3 w-3" />
            </button>
            {categories.length > 0 && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-screen max-w-7xl bg-white shadow-xl rounded-lg p-6 grid grid-cols-4 gap-6 border opacity-0 invisible translate-y-1 group-hover/shop:opacity-100 group-hover/shop:visible group-hover/shop:translate-y-0 transition-all duration-150">
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
          </div>

          {/* Brands — narrow dropdown, names only, opens on hover */}
          <div className="relative group/brands">
            <button className="text-sm font-medium hover:text-gray-600 transition flex items-center gap-1 py-6">
              Brands
              <ChevronDown className="h-3 w-3" />
            </button>
            {brands.length > 0 && (
              <div className="absolute left-0 top-full min-w-[200px] bg-white shadow-xl rounded-lg p-3 border opacity-0 invisible translate-y-1 group-hover/brands:opacity-100 group-hover/brands:visible group-hover/brands:translate-y-0 transition-all duration-150">
                <ul className="space-y-1">
                  {brands.map((brand) => (
                    <li key={brand.id}>
                      <Link
                        href={`/brands/${brand.slug}`}
                        className="block text-sm text-gray-600 hover:text-black hover:bg-gray-50 rounded px-2 py-1.5 transition"
                      >
                        {brand.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                <DropdownMenuSeparator className="my-2" />
                <Link
                  href="/brands"
                  className="block text-sm font-medium px-2 py-1.5 hover:bg-gray-50 rounded transition"
                >
                  View All Brands
                </Link>
              </div>
            )}
          </div>

          <Link href="/wholesale" className="text-sm font-medium hover:text-gray-600 transition">
            Wholesale
          </Link>
          <Link href="/gallery" className="text-sm font-medium hover:text-gray-600 transition">
            Gallery
          </Link>
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
              <nav className="flex flex-col gap-1 mt-8">
                <MobileNavLink href="/">Home</MobileNavLink>

                {/* Shop — expandable accordion in mobile */}
                {categories.length > 0 ? (
                  <MobileAccordion title="Shop">
                    <div className="flex flex-col gap-1 pb-1">
                      <MobileNavLink href="/shop" className="text-sm text-gray-500">All Products</MobileNavLink>
                      {categories.map((cat) => (
                        <MobileAccordion key={cat.id} title={cat.name} nested>
                          <MobileNavLink href={`/shop/${cat.slug}`} className="text-sm text-gray-500 pl-2">
                            All {cat.name}
                          </MobileNavLink>
                          {cat.subcategories.map((sub) => (
                            <MobileNavLink key={sub.id} href={`/shop/${cat.slug}/${sub.slug}`} className="text-sm text-gray-500 pl-2">
                              {sub.name}
                            </MobileNavLink>
                          ))}
                        </MobileAccordion>
                      ))}
                    </div>
                  </MobileAccordion>
                ) : (
                  <MobileNavLink href="/shop">Shop</MobileNavLink>
                )}

                {/* Brands — expandable accordion in mobile */}
                {brands.length > 0 ? (
                  <MobileAccordion title="Brands">
                    <div className="flex flex-col gap-1 pb-1">
                      {brands.map((brand) => (
                        <MobileNavLink key={brand.id} href={`/brands/${brand.slug}`} className="text-sm text-gray-500">
                          {brand.name}
                        </MobileNavLink>
                      ))}
                      <MobileNavLink href="/brands" className="text-sm font-medium">View All Brands</MobileNavLink>
                    </div>
                  </MobileAccordion>
                ) : (
                  <MobileNavLink href="/brands">Brands</MobileNavLink>
                )}

                <MobileNavLink href="/wholesale">Wholesale</MobileNavLink>
                <MobileNavLink href="/gallery">Gallery</MobileNavLink>
                {dashboardLink && (
                  <MobileNavLink href={dashboardLink.href}>
                    <span className="flex items-center gap-2">
                      <dashboardLink.icon className="h-4 w-4" />
                      {dashboardLink.label}
                    </span>
                  </MobileNavLink>
                )}
                <hr className="my-2" />
                {session ? (
                  <button onClick={handleSignOut} className="text-left px-4 py-3 text-lg font-medium text-red-600 min-h-[44px]">
                    Sign Out
                  </button>
                ) : (
                  <MobileNavLink href="/login">Sign In</MobileNavLink>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

/** Mobile link with minimum 44px touch target */
function MobileNavLink({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        "block px-4 py-3 text-lg font-medium min-h-[44px] flex items-center",
        className,
      )}
    >
      {children}
    </Link>
  )
}

/** Tappable accordion toggle for mobile menu — tap to expand/collapse */
function MobileAccordion({
  title,
  children,
  nested = false,
}: {
  title: string
  children: React.ReactNode
  nested?: boolean
}) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 text-lg font-medium min-h-[44px] hover:bg-gray-50",
          nested && "text-base font-normal pl-6",
        )}
      >
        {title}
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>
      {open && <div className={nested ? "pl-2" : ""}>{children}</div>}
    </div>
  )
}
