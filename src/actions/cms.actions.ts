"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role } from "@prisma/client"

// Hero Banner
export async function updateHeroBanner(id: string, data: any) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.ADMIN && session.user.role !== Role.MARKETING_MANAGER)) throw new Error("Unauthorized")
  const banner = await prisma.heroBanner.update({ where: { id }, data })
  revalidatePath("/admin/cms/hero")
  revalidatePath("/")
  return banner
}

// Promotional Banner, Testimonial, Editorial Block, etc. follow similar pattern.

export async function reorderHomepageSections(sections: { id: string; order: number }[]) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.ADMIN && session.user.role !== Role.MARKETING_MANAGER)) throw new Error("Unauthorized")
  await Promise.all(sections.map(({ id, order }) => prisma.homepageSection.update({ where: { id }, data: { order } })))
  revalidatePath("/admin/cms/homepage")
  revalidatePath("/")
}