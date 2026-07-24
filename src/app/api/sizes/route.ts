import { NextResponse } from "next/server"
import { getSizes } from "@/lib/data"

export const dynamic = "force-dynamic"

export async function GET() {
  const sizeSystems = await getSizes()
  return NextResponse.json(sizeSystems)
}