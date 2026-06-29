import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const sections = await req.json()
  await prisma.$transaction(
    sections.map(({ id, order }: { id: string; order: number }) =>
      prisma.homepageSection.update({ where: { id }, data: { order } })
    )
  )
  return NextResponse.json({ success: true })
}