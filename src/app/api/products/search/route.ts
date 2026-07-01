import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || ""
  if (q.length < 2) return NextResponse.json([])
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { sku: { contains: q, mode: "insensitive" } },
        { brand: { name: { contains: q, mode: "insensitive" } } },
      ],
    },
    include: { brand: true, variants: true },
    take: 20,
  })
  return NextResponse.json(products)
}