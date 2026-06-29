import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const hero = await prisma.heroBanner.findFirst({
    where: { active: true },
    orderBy: { order: "asc" },
  })
  return NextResponse.json(hero)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const data = await req.json()
  const hero = await prisma.heroBanner.create({ data })
  return NextResponse.json(hero)
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id, ...data } = await req.json()
  const hero = await prisma.heroBanner.update({ where: { id }, data })
  return NextResponse.json(hero)
}