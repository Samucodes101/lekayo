import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const sections = await prisma.homepageSection.findMany({
    orderBy: [{ order: "asc" }],
  })
  return NextResponse.json(sections)
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id, visible } = await req.json()
  const section = await prisma.homepageSection.update({
    where: { id },
    data: { visible },
  })
  return NextResponse.json(section)
}