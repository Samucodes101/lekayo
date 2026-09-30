import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

const STAFF = ["CUSTOMER_SERVICE", "ADMIN", "SUPER_ADMIN"]

// Pages anyone can view
const publicPagePaths = [
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

// API routes guests may call, restricted by HTTP method
const guestApi: { prefix: string; methods: string[] }[] = [
  { prefix: "/api/brands", methods: ["GET"] },
  { prefix: "/api/categories", methods: ["GET"] },
  { prefix: "/api/colors", methods: ["GET"] },
  { prefix: "/api/sizes", methods: ["GET"] },
  { prefix: "/api/products", methods: ["GET"] },
  { prefix: "/api/search", methods: ["GET"] },
  { prefix: "/api/cms", methods: ["GET"] },
  { prefix: "/api/contact", methods: ["POST"] },
  { prefix: "/api/newsletter", methods: ["POST"] },
  { prefix: "/api/wholesale/apply", methods: ["POST"] },
  { prefix: "/api/orders/track", methods: ["GET", "POST"] },
  { prefix: "/api/checkout/init", methods: ["POST"] },
  { prefix: "/api/checkout/pay", methods: ["POST"] },
  { prefix: "/api/checkout/order", methods: ["GET"] },
]

// API routes with no auth check of their own: enforce staff role here
const staffApi = [
  "/api/cs",
  "/api/customers",
  "/api/inventory",
  "/api/orders/search",
  "/api/upload",
]

const matches = (path: string, prefix: string) =>
  path === prefix || path.startsWith(prefix + "/")

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname
    const isApi = path.startsWith("/api/")

    const deny = (status: 401 | 403) =>
      NextResponse.json(
        { error: status === 401 ? "Unauthorized" : "Forbidden" },
        { status }
      )

    const toLogin = () => {
      const url = req.nextUrl.clone()
      url.pathname = "/login"
      url.search = ""
      url.searchParams.set("callbackUrl", path)
      return NextResponse.redirect(url)
    }

    const toHome = () => {
      const url = req.nextUrl.clone()
      url.pathname = "/"
      url.search = ""
      return NextResponse.redirect(url)
    }

    // 1. Public pages / auth / webhooks
    if (publicPagePaths.some((p) => matches(path, p))) {
      return NextResponse.next()
    }

    // 2. Guest-accessible API (method-aware)
    if (
      isApi &&
      guestApi.some((g) => matches(path, g.prefix) && g.methods.includes(req.method))
    ) {
      return NextResponse.next()
    }

    // 3. Everything else requires a session.
    //    APIs get JSON, never an HTML redirect.
    if (!token) {
      return isApi ? deny(401) : toLogin()
    }

    const role = token.role as string

    // 4. Staff-only APIs
    if (staffApi.some((p) => matches(path, p)) && !STAFF.includes(role)) {
      return deny(403)
    }
    if (matches(path, "/api/dev") && role !== "DEVELOPER" && role !== "SUPER_ADMIN") {
      return deny(403)
    }

    // 5. Page role checks
    if (path.startsWith("/admin")) {
      if (role !== "SUPER_ADMIN" && role !== "ADMIN") return toHome()
    }
    if (path.startsWith("/cs")) {
      if (!STAFF.includes(role)) return toHome()
    }
    if (path.startsWith("/dev")) {
      if (role !== "DEVELOPER" && role !== "SUPER_ADMIN") return toHome()
    }

    // Account, checkout and other authenticated routes
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: () => true,
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
    "/checkout/:path*",
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