import { NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/mail"

export async function POST(req: NextRequest) {
  const { name, email, subject, message } = await req.json()
  await sendEmail(
    process.env.SMTP_FROM || "hello@lekayo.com",
    `Contact: ${subject}`,
    `<p><strong>From:</strong> ${name} (${email})</p><p>${message}</p>`
  )
  return NextResponse.json({ success: true })
}