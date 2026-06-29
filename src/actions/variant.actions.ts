"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role } from "@prisma/client"

export async function createVariant(data: any) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.ADMIN)) throw new Error("Unauthorized")
  const variant = await prisma.productVariant.create({ data: { ...data, images: { create: data.images || [] } } })
  revalidatePath("/admin/inventory")
  revalidatePath(`/admin/products/${data.productId}`)
  return variant
}

export async function updateVariant(id: string, data: any) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.ADMIN)) throw new Error("Unauthorized")
  const variant = await prisma.productVariant.update({ where: { id }, data })
  revalidatePath("/admin/inventory")
  return variant
}

export async function deleteVariant(id: string) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.ADMIN)) throw new Error("Unauthorized")
  await prisma.productVariant.delete({ where: { id } })
  revalidatePath("/admin/inventory")
}