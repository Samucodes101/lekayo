"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role } from "@prisma/client"

export async function createCategory(data: any) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.ADMIN)) throw new Error("Unauthorized")
  const category = await prisma.category.create({ data })
  revalidatePath("/admin/categories")
  return category
}

export async function updateCategory(id: string, data: any) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.ADMIN)) throw new Error("Unauthorized")
  const category = await prisma.category.update({ where: { id }, data })
  revalidatePath("/admin/categories")
  revalidatePath("/shop")
  return category
}

export async function deleteCategory(id: string) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.ADMIN)) throw new Error("Unauthorized")
  await prisma.category.delete({ where: { id } })
  revalidatePath("/admin/categories")
}