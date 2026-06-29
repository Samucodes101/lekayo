import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const blocks = await prisma.editorialBlock.findMany({
    include: { products: { include: { product: true } } },
    orderBy: [{ order: "asc" }],
  })
  return NextResponse.json(blocks)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const data = await req.json()
  const block = await prisma.editorialBlock.create({ data })
  return NextResponse.json(block)
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id, ...data } = await req.json()
  const block = await prisma.editorialBlock.update({ where: { id }, data })
  return NextResponse.json(block)
}