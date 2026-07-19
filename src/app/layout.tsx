import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { prisma } from "@/lib/db"
import "./globals.css"
import { Providers } from "./providers"
import Navbar from "@/components/shared/Navbar"
import Footer from "@/components/shared/Footer"
import { Toaster } from "@/components/ui/toaster"
import CommandPalette from "@/components/shared/CommandPalette"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Lekayo | Luxury Fashion",
  description: "Premium fashion destination",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const categories = await prisma.category.findMany({
    include: { subcategories: true },
    where: { subcategories: { some: {} } },
    orderBy: { order: "asc" },
  })

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navbar categories={categories} />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster />
          <CommandPalette />
        </Providers>
      </body>
    </html>
  )
}