import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { Role } from '@prisma/client'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Public routes (no auth needed)
    const publicPaths = ['/', '/shop', '/products', '/brands', '/search', '/cart', '/checkout', '/wholesale', '/about', '/contact', '/privacy-policy', '/terms', '/api/webhooks']
    if (publicPaths.some(p => path.startsWith(p))) {
      return NextResponse.next()
    }

    // Account routes require authentication
    if (path.startsWith('/account') && !token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Admin routes: only SUPER_ADMIN and ADMIN
    if (path.startsWith('/admin') && token) {
      const role = token.role as Role
      if (role !== Role.SUPER_ADMIN && role !== Role.ADMIN) {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    // Customer service routes
    if (path.startsWith('/cs') && token) {
      const role = token.role as Role
      if (role !== Role.CUSTOMER_SERVICE && role !== Role.ADMIN && role !== Role.SUPER_ADMIN) {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    // Developer routes
    if (path.startsWith('/dev') && token) {
      const role = token.role as Role
      if (role !== Role.DEVELOPER && role !== Role.SUPER_ADMIN) {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => true, // we handle logic above
    },
  }
)

export const config = {
  matcher: [
    '/account/:path*',
    '/admin/:path*',
    '/cs/:path*',
    '/dev/:path*',
    '/checkout',
    '/api/:path*',
  ],
}