import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const type = req.nextUrl.searchParams.get("type") || "sales"
  const format = req.nextUrl.searchParams.get("format") || "csv"
  // Build report data based on type
  let data: Array<Record<string, unknown>> = []
  switch (type) {
    case "sales":
      data = await prisma.order.findMany({ include: { items: true } })
      break
    case "inventory":
      data = await prisma.productVariant.findMany({ include: { product: true } })
      break
    case "customers":
      data = await prisma.user.findMany({ where: { role: "CUSTOMER" } })
      break
    default:
      data = []
  }
  // Convert to CSV (simplified)
  const csv = "Report\n" + JSON.stringify(data, null, 2)
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=lekayo-${type}-report.${format}`,
    },
  })
}