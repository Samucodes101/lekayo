import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { Role } from "@prisma/client"

export async function permissionMiddleware(req: NextRequest) {
  const token = await getToken({ req })
  const path = req.nextUrl.pathname

  // Public routes
  const publicPaths = ["/", "/shop", "/products", "/brands", "/search", "/cart", "/checkout", "/wholesale", "/about", "/contact", "/privacy-policy", "/terms", "/api/webhooks"]
  if (publicPaths.some(p => path.startsWith(p)) || path.startsWith("/api/auth") || path.startsWith("/_next") || path.startsWith("/favicon.ico")) {
    return NextResponse.next()
  }

  // Account routes require authentication
  if (path.startsWith("/account")) {
    if (!token) return NextResponse.redirect(new URL("/login", req.url))
  }

  // Admin routes
  if (path.startsWith("/admin")) {
    if (!token) return NextResponse.redirect(new URL("/login", req.url))
    const role = token.role as Role
    if (role !== Role.SUPER_ADMIN && role !== Role.ADMIN) {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  // Customer Service routes
  if (path.startsWith("/cs")) {
    if (!token) return NextResponse.redirect(new URL("/login", req.url))
    const role = token.role as Role
    if (role !== Role.CUSTOMER_SERVICE && role !== Role.ADMIN && role !== Role.SUPER_ADMIN) {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  // Developer routes
  if (path.startsWith("/dev")) {
    if (!token) return NextResponse.redirect(new URL("/login", req.url))
    const role = token.role as Role
    if (role !== Role.DEVELOPER && role !== Role.SUPER_ADMIN) {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  return NextResponse.next()
}