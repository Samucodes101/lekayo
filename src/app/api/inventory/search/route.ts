import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || ""
  if (q.length < 2) return NextResponse.json([])
  const variants = await prisma.productVariant.findMany({
    where: {
      OR: [
        { sku: { contains: q, mode: "insensitive" } },
        { product: { name: { contains: q, mode: "insensitive" } } },
      ],
    },
    include: { product: true },
    take: 20,
  })
  return NextResponse.json(variants)
}