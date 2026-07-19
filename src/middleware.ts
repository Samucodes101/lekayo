import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Public routes (including auth pages)
    const publicPaths = [
      "/",
      "/shop",
      "/products",
      "/brands",
      "/search",
      "/cart",
      "/checkout",
      "/wholesale",
      "/about",
      "/contact",
      "/privacy-policy",
      "/terms",
      "/login",
      "/register",
      "/forgot-password",
      "/api/auth",
      "/api/webhooks",
      "/_next",
      "/favicon.ico",
    ]
    if (publicPaths.some((p) => path === p || path.startsWith(p + "/"))) {
      return NextResponse.next()
    }

    // Protected routes – require authentication
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Role checks
    const role = token.role as string
    if (path.startsWith("/admin")) {
      if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url))
      }
    }
    if (path.startsWith("/cs")) {
      if (role !== "CUSTOMER_SERVICE" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/", req.url))
      }
    }
    if (path.startsWith("/dev")) {
      if (role !== "DEVELOPER" && role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/", req.url))
      }
    }
    // Account routes – any authenticated user can access
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => true,
    },
  }
)

export const config = {
  matcher: [
    "/",
    "/shop/:path*",
    "/products/:path*",
    "/brands/:path*",
    "/search",
    "/cart",
    "/checkout",
    "/wholesale",
    "/about",
    "/contact",
    "/privacy-policy",
    "/terms",
    "/login",
    "/register",
    "/forgot-password",
    "/account/:path*",
    "/admin/:path*",
    "/cs/:path*",
    "/dev/:path*",
    "/api/:path*",
  ],
}