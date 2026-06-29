import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  const orderNumber = req.nextUrl.searchParams.get("orderNumber")
  if (!orderNumber) return NextResponse.json({ error: "Missing order number" }, { status: 400 })
  const order = await prisma.order.findUnique({ where: { orderNumber } })
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
  return NextResponse.json({ status: order.status })
}