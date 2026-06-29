import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (id) {
    const product = await prisma.product.findUnique({ where: { id }, include: { variants: { include: { images: true } }, brand: true, category: true } })
    return NextResponse.json(product)
  }
  const products = await prisma.product.findMany({ include: { variants: { include: { images: true } }, brand: true } })
  return NextResponse.json(products)
}