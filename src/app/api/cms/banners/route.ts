import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DATA_TAGS, getPromotionalBanners } from "@/lib/data"
import { revalidateTag } from "next/cache"

export const dynamic = "force-dynamic"

export async function GET() {
  const banners = await getPromotionalBanners()
  return NextResponse.json(banners)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const data = await req.json()
  const banner = await prisma.promotionalBanner.create({ data })
  revalidateTag(DATA_TAGS.homepageCms)
  return NextResponse.json(banner)
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id, ...data } = await req.json()
  const banner = await prisma.promotionalBanner.update({ where: { id }, data })
  revalidateTag(DATA_TAGS.homepageCms)
  return NextResponse.json(banner)
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  await prisma.promotionalBanner.delete({ where: { id } })
  revalidateTag(DATA_TAGS.homepageCms)
  return NextResponse.json({ success: true })
}