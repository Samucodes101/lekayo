import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: [{ order: "asc" }],
  })
  return NextResponse.json(testimonials)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const data = await req.json()
  const testimonial = await prisma.testimonial.create({ data })
  return NextResponse.json(testimonial)
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id, ...data } = await req.json()
  const testimonial = await prisma.testimonial.update({ where: { id }, data })
  return NextResponse.json(testimonial)
}