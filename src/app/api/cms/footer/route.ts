import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const footer = await prisma.setting.findUnique({
    where: { key: "footer" },
  })
  return NextResponse.json(footer?.value || {})
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const data = await req.json()
  const footer = await prisma.setting.upsert({
    where: { key: "footer" },
    update: { value: data },
    create: { key: "footer", value: data },
  })
  return NextResponse.json(footer)
}