import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  await prisma.newsletterSubscriber.upsert({ where: { email }, update: {}, create: { email } })
  return NextResponse.json({ success: true })
}