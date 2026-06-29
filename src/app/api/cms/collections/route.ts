import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const collections = await prisma.styleCollection.findMany({
    include: { products: { include: { product: true } } },
    orderBy: { name: "asc" },
  })
  return NextResponse.json(collections)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const data = await req.json()
  const collection = await prisma.styleCollection.create({ data })
  return NextResponse.json(collection)
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id, ...data } = await req.json()
  const collection = await prisma.styleCollection.update({ where: { id }, data })
  return NextResponse.json(collection)
}