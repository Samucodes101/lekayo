import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role } from "@prisma/client"

// GET all subcategories for a category
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const subcategories = await prisma.subcategory.findMany({
    where: { categoryId: params.id },
    orderBy: { name: "asc" },
  })
  return NextResponse.json(subcategories)
}

// POST new subcategory
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.ADMIN)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { name, slug, description } = await req.json()
  if (!name || !slug) {
    return NextResponse.json({ error: "Name and slug are required" }, { status: 400 })
  }

  const subcategory = await prisma.subcategory.create({
    data: {
      name,
      slug,
      description,
      categoryId: params.id,
    },
  })
  return NextResponse.json(subcategory)
}

// PUT update subcategory
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.ADMIN)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id, name, slug, description } = await req.json()
  if (!id) {
    return NextResponse.json({ error: "Subcategory ID is required" }, { status: 400 })
  }

  const subcategory = await prisma.subcategory.update({
    where: { id },
    data: { name, slug, description },
  })
  return NextResponse.json(subcategory)
}

// DELETE subcategory
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.ADMIN)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const subcategoryId = req.nextUrl.searchParams.get("id")
  if (!subcategoryId) {
    return NextResponse.json({ error: "Subcategory ID is required" }, { status: 400 })
  }

  await prisma.subcategory.delete({
    where: { id: subcategoryId },
  })
  return NextResponse.json({ success: true })
}