import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json()
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : ""
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (existing) {
    return NextResponse.json({ error: "Email already exists" }, { status: 400 })
  }
  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { name, email: normalizedEmail, password: hashed },
  })
  return NextResponse.json({ success: true, user: { id: user.id, email: user.email } })
}