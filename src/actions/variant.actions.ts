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

  const variant = await prisma.productVariant.findUnique({ where: { id }, select: { id: true } })
  if (!variant) throw new Error("Variant not found")

  // OrderItem -> ProductVariant and InventoryLog -> ProductVariant are both RESTRICT.
  // A variant with order or inventory history cannot be hard-deleted; archive it instead.
  const [orderItemCount, inventoryLogCount] = await Promise.all([
    prisma.orderItem.count({ where: { variantId: id } }),
    prisma.inventoryLog.count({ where: { variantId: id } }),
  ])

  if (orderItemCount > 0 || inventoryLogCount > 0) {
    await prisma.productVariant.update({ where: { id }, data: { isActive: false } })
    revalidatePath("/admin/inventory")
    return { archived: true }
  }

  // No history - safe to hard delete. Clean up cart items first (CartItem is CASCADE,
  // but being explicit avoids any edge cases).
  await prisma.cartItem.deleteMany({ where: { variantId: id } })
  await prisma.productVariant.delete({ where: { id } })
  revalidatePath("/admin/inventory")
  return { deleted: true }
}