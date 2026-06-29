import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const settings = await prisma.setting.findMany()
  const settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {})
  return NextResponse.json({
    siteName: settingsMap.siteName || "Lekayo",
    siteDescription: settingsMap.siteDescription || "Luxury fashion destination",
    contactEmail: settingsMap.contactEmail || "",
    contactPhone: settingsMap.contactPhone || "",
    address: settingsMap.address || "",
    shippingRate: settingsMap.shippingRate || 0,
    taxRate: settingsMap.taxRate || 0,
  })
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const data = await req.json()
  await prisma.$transaction(
    Object.entries(data).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    )
  )
  return NextResponse.json({ success: true })
}