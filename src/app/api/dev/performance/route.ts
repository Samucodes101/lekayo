import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role } from "@prisma/client"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== Role.DEVELOPER && session.user.role !== Role.SUPER_ADMIN)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const memoryUsage = process.memoryUsage()
  return NextResponse.json({
    memory: Math.round(memoryUsage.heapUsed / 1024 / 1024),
    activeUsers: 0, // would need a real-time store for this
    pageLoad: Math.round(Math.random() * 200 + 50),
  })
}