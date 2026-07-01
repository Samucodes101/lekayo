import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || ""
  if (q.length < 2) return NextResponse.json([])
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    },
    include: { _count: { select: { orders: true } } },
    take: 20,
  })
  return NextResponse.json(users)
}