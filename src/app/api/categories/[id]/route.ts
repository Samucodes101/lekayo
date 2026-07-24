import { NextRequest, NextResponse } from "next/server"
import { getCategoryById } from "@/lib/data"

export const dynamic = "force-dynamic"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const category = await getCategoryById(params.id)
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 })
  }
  return NextResponse.json(category)
}