import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")
  if (!token) {
    return NextResponse.json({ valid: false })
  }
  const record = await prisma.passwordResetToken.findUnique({
    where: { token, used: false, expiresAt: { gt: new Date() } },
  })
  return NextResponse.json({ valid: !!record })
}