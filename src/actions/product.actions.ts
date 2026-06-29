"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { productSchema } from "@/lib/validators/product.zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role } from "@prisma/client"

export async function createProduct(data: any) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.ADMIN)) throw new Error("Unauthorized")

  const validated = productSchema.parse(data)
  const product = await prisma.product.create({
    data: {
      ...validated,
      slug: validated.name.toLowerCase().replace(/ /g, "-"),
      variants: { create: validated.variants },
    },
  })
  revalidatePath("/admin/products")
  revalidatePath("/shop")
  return product
}

export async function updateProduct(id: string, data: any) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.ADMIN)) throw new Error("Unauthorized")

  const validated = productSchema.parse(data)
  const product = await prisma.product.update({ where: { id }, data: validated })
  revalidatePath(`/admin/products/${id}`)
  revalidatePath(`/products/${product.slug}`)
  return product
}

export async function deleteProduct(id: string) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.ADMIN)) throw new Error("Unauthorized")

  await prisma.product.delete({ where: { id } })
  revalidatePath("/admin/products")
}