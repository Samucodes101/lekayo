"use server"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role } from "@prisma/client"

function ensureAdmin(session: Awaited<ReturnType<typeof getServerSession>>) {
  const role = (session as any)?.user?.role
  if (!role || (role !== Role.SUPER_ADMIN && role !== Role.ADMIN)) {
    throw new Error("Unauthorized")
  }
}

// Centralize the list of public-facing paths that depend on brand data,
// so every mutation stays in sync automatically — one place to update.
function revalidateBrandPaths() {
  revalidatePath("/admin/brands")
  revalidatePath("/shop")
  revalidatePath("/brands")
  revalidatePath("/admin/products/new")   // wherever the product-creation form lives
  revalidatePath("/admin/products")       // if product list/edit also shows brand names
  revalidatePath("/", "layout")           // if brands appear in Navbar/mega-menu globally
}

export async function createBrand(data: any) {
  const session = await getServerSession(authOptions)
  ensureAdmin(session)
  const brand = await prisma.brand.create({ data })
  revalidateBrandPaths()
  return brand
}

export async function updateBrand(id: string, data: any) {
  const session = await getServerSession(authOptions)
  ensureAdmin(session)
  const brand = await prisma.brand.update({ where: { id }, data })
  revalidateBrandPaths()
  return brand
}

export async function deleteBrand(id: string) {
  const session = await getServerSession(authOptions)
  ensureAdmin(session)
  await prisma.brand.delete({ where: { id } })
  revalidateBrandPaths()
}