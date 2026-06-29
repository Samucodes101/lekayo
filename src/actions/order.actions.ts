"use server"

import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { OrderStatus } from "@prisma/client"

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) throw new Error("Unauthorized")

  const order = await prisma.order.update({ where: { id: orderId }, data: { status } })
  revalidatePath(`/admin/orders/${orderId}`)
  return order
}