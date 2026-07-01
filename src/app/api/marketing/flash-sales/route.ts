import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const sales = await prisma.flashSale.findMany({
    include: { products: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(sales)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const data = await req.json()
  const sale = await prisma.flashSale.create({
    data: {
      ...data,
      startsAt: new Date(data.startsAt),
      endsAt: new Date(data.endsAt),
    },
  })
  return NextResponse.json(sale)
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id, ...data } = await req.json()
  const sale = await prisma.flashSale.update({
    where: { id },
    data: {
      ...data,
      startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
      endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
    },
  })
  return NextResponse.json(sale)
}