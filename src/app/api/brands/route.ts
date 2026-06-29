import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
  })
  return NextResponse.json(brands)
}