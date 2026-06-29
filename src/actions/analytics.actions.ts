"use server"

import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role } from "@prisma/client"

export async function getSalesAnalytics(startDate: Date, endDate: Date) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.ADMIN)) throw new Error("Unauthorized")
  const orders = await prisma.order.groupBy({
    by: ["createdAt"],
    where: { createdAt: { gte: startDate, lte: endDate }, status: { not: "CANCELLED" } },
    _sum: { total: true },
    orderBy: { createdAt: "asc" },
  })
  return orders
}