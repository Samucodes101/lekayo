import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { sendEmail } from "@/lib/mail"

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: "Email not found" }, { status: 404 })
  // Generate reset token (simplified)
  const token = Buffer.from(email + Date.now()).toString("base64")
  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
  await sendEmail(
    email,
    "Reset your Lekayo password",
    `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
  )
  return NextResponse.json({ success: true })
}