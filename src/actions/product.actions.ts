"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role } from "@prisma/client"

export async function createProduct(data: any) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.ADMIN)) {
    throw new Error("Unauthorized")
  }

  const { variants, ...productData } = data

  const product = await prisma.product.create({
    data: {
      ...productData,
      slug: productData.name.toLowerCase().replace(/ /g, "-"),
      variants: {
        create: variants?.map((v: any) => ({
          sku: v.sku,
          stock: v.stock,
          price: v.price || null,
          colorId: v.colorId || null,
          sizeValue: v.sizeValue || null,
          images: {
            create: v.images?.map((img: any) => ({
              url: img.url,
              publicId: img.publicId,
              altText: img.altText || "",
            })) || [],
          },
        })) || [],
      },
    },
    include: { variants: { include: { images: true } } },
  })

  revalidatePath("/admin/products")
  revalidatePath("/shop")
  return product
}

export async function updateProduct(id: string, data: any) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.ADMIN)) {
    throw new Error("Unauthorized")
  }

  const { variants, ...productData } = data

  // Update product basic info
  await prisma.product.update({
    where: { id },
    data: {
      ...productData,
      slug: productData.name.toLowerCase().replace(/ /g, "-"),
    },
  })

  // Delete all existing variants and their images (cascade delete)
  await prisma.productVariant.deleteMany({
    where: { productId: id },
  })

  // Recreate variants with images
  if (variants && variants.length > 0) {
    // Create variants one by one to get their IDs for images
    for (const v of variants) {
      const variant = await prisma.productVariant.create({
        data: {
          sku: v.sku,
          stock: v.stock,
          price: v.price || null,
          colorId: v.colorId || null,
          sizeValue: v.sizeValue || null,
          productId: id,
        },
      })

      // Create images for this variant
      if (v.images && v.images.length > 0) {
        await prisma.variantImage.createMany({
          data: v.images.map((img: any) => ({
            url: img.url,
            publicId: img.publicId,
            altText: img.altText || "",
            variantId: variant.id,
          })),
        })
      }
    }
  }

  revalidatePath(`/admin/products/${id}`)
  revalidatePath(`/products/${productData.slug || id}`)
  revalidatePath("/admin/products")
  return { success: true }
}

export async function deleteProduct(id: string) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.ADMIN)) {
    throw new Error("Unauthorized")
  }

  await prisma.product.delete({ where: { id } })
  revalidatePath("/admin/products")
}