import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const wholesale = await prisma.setting.findUnique({
    where: { key: "wholesale" },
  })
  return NextResponse.json(wholesale?.value || {})
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const data = await req.json()
  const wholesale = await prisma.setting.upsert({
    where: { key: "wholesale" },
    update: { value: data },
    create: { key: "wholesale", value: data },
  })
  return NextResponse.json(wholesale)
}