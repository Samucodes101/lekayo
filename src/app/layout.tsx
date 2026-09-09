import type { Metadata } from "next"
import { Raleway } from "next/font/google"
import { prisma } from "@/lib/db"
import "./globals.css"
import { Providers } from "./providers"
import Navbar from "@/components/shared/Navbar"
import Footer from "@/components/shared/Footer"
import { Toaster } from "@/components/ui/toaster"
import CommandPalette from "@/components/shared/CommandPalette"

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Lekayo | Luxury Fashion",
  description: "Premium fashion destination",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      include: { subcategories: true },
      where: { featured: true, subcategories: { some: {} } },
      orderBy: { order: "asc" },
      take: 6,
    }),
    prisma.brand.findMany({
      where: { featured: true },
      orderBy: { order: "asc" },
      take: 12,
    }),
  ])

  return (
    <html lang="en" className={raleway.variable}>
      <body className={raleway.className}>
        <Providers>
          <Navbar categories={categories} brands={brands} />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster />
          <CommandPalette />
        </Providers>
      </body>
    </html>
  )
}