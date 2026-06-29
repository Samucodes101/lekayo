"use server"

import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function updateStock(variantId: string, newStock: number) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "INVENTORY_MANAGER" && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) throw new Error("Unauthorized")

  const variant = await prisma.productVariant.findUnique({ where: { id: variantId } })
  if (!variant) throw new Error("Variant not found")

  await prisma.$transaction([
    prisma.productVariant.update({ where: { id: variantId }, data: { stock: newStock } }),
    prisma.inventoryLog.create({
      data: { variantId, previousStock: variant.stock, newStock, changeAmount: newStock - variant.stock, reason: "Manual adjustment", userId: session.user.id },
    }),
  ])
  revalidatePath("/admin/inventory")
}