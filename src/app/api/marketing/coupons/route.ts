import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(coupons)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const data = await req.json()
  const coupon = await prisma.coupon.create({
    data: {
      ...data,
      validFrom: new Date(data.validFrom),
      validUntil: new Date(data.validUntil),
    },
  })
  return NextResponse.json(coupon)
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id, ...data } = await req.json()
  const coupon = await prisma.coupon.update({
    where: { id },
    data: {
      ...data,
      validFrom: data.validFrom ? new Date(data.validFrom) : undefined,
      validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
    },
  })
  return NextResponse.json(coupon)
}