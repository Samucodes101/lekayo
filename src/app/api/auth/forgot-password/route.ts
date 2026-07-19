import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  const { token, password } = await req.json()
  if (!token || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }
  const record = await prisma.passwordResetToken.findUnique({
    where: { token, used: false, expiresAt: { gt: new Date() } },
  })
  if (!record) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
  }
  const hashed = await bcrypt.hash(password, 10)
  await prisma.$transaction([
    prisma.user.update({
      where: { email: record.email },
      data: { password: hashed },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { used: true },
    }),
  ])
  return NextResponse.json({ success: true })
}