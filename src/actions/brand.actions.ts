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

export async function createBrand(data: any) {
  const session = await getServerSession(authOptions)
  ensureAdmin(session)

  const brand = await prisma.brand.create({ data })
  revalidatePath("/admin/brands")
  return brand
}

export async function updateBrand(id: string, data: any) {
  const session = await getServerSession(authOptions)
  ensureAdmin(session)

  const brand = await prisma.brand.update({ where: { id }, data })
  revalidatePath("/admin/brands")
  return brand
}

export async function deleteBrand(id: string) {
  const session = await getServerSession(authOptions)
  ensureAdmin(session)

  await prisma.brand.delete({ where: { id } })
  revalidatePath("/admin/brands")
}
