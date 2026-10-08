"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { OrderStatus } from "@prisma/client"
import { restockOrder } from "@/lib/stockReservation"

export async function updateOrderStatus(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    throw new Error("Unauthorized")
  }

  const orderId = formData.get("orderId") as string
  const status = formData.get("status") as OrderStatus

  if (!orderId || !status) {
    throw new Error("Missing orderId or status")
  }

  const order = await prisma.$transaction(async (tx) => {
    // Cancelled and returned orders put their units back into stock.
    if (status === "CANCELLED" || status === "RETURNED") {
      await restockOrder(tx, orderId)
    }
    return tx.order.update({
      where: { id: orderId },
      data: { status },
    })
  })
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath("/admin/orders")
  return order
}

export async function getOrderById(orderId: string) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error("Unauthorized")
  return prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true, items: { include: { variant: { include: { product: true } } } }, shippingAddress: true },
  })
}