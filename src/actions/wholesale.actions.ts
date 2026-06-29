"use server"

import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function submitWholesaleApplication(data: any) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error("Unauthorized")

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } })
  return prisma.wholesaleApplication.create({ data: { ...data, userId: user!.id } })
}