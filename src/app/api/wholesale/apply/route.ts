import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const application = await prisma.wholesaleApplication.create({ data: body })
  return NextResponse.json(application)
}