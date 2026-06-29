import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  const colors = await prisma.color.findMany({
    orderBy: { name: "asc" },
  })
  return NextResponse.json(colors)
}