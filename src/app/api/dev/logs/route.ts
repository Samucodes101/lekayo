import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role } from "@prisma/client"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== Role.DEVELOPER && session.user.role !== Role.SUPER_ADMIN)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  })
  return NextResponse.json(logs)
}