"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function addToCart(variantId: string, quantity: number) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error("Unauthorized")

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } })
  const existing = await prisma.cartItem.findUnique({ where: { userId_variantId: { userId: user!.id, variantId } } })
  if (existing) {
    await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + quantity } })
  } else {
    await prisma.cartItem.create({ data: { userId: user!.id, variantId, quantity } })
  }
  revalidatePath("/cart")
}