import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { name } = await req.json()
  await prisma.user.update({ where: { email: session.user.email }, data: { name } })
  return NextResponse.json({ success: true })
}