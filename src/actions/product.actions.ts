"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Prisma, Role } from "@prisma/client"

export async function createProduct(data: any) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.ADMIN)) {
    throw new Error("Unauthorized")
  }

  const { variants, ...productData } = data

  try {
    const product = await prisma.product.create({
      data: {
        ...productData,
        slug: productData.name.toLowerCase().replace(/ /g, "-"),
        variants: {
          create: variants?.map((v: any) => ({
            order: v.order ?? 0,
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
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const target = error.meta?.target as string[] | undefined
      if (target?.includes("sku")) {
        throw new Error(
          "This SKU is already in use by another product or variant. Please choose a different SKU.",
        )
      }
      if (target?.includes("slug")) {
        throw new Error(
          "A product with this name already exists. Please use a different name.",
        )
      }
    }
    throw error
  }
}

export async function updateProduct(id: string, data: any) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.ADMIN)) {
    throw new Error("Unauthorized")
  }

  const { variants, ...productData } = data
  const slug = productData.name.toLowerCase().replace(/ /g, "-")

  await prisma.$transaction(async (tx) => {
    // Update product basic info
    try {
      await tx.product.update({
        where: { id },
        data: {
          ...productData,
          slug,
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const target = error.meta?.target as string[] | undefined
        if (target?.includes("sku")) {
          throw new Error(
          "This SKU is already in use by another product or variant. Please choose a different SKU.",
          )
        }
        if (target?.includes("slug")) {
          throw new Error(
            "A product with this name already exists. Please use a different name.",
          )
        }
      }
      throw error
    }

    // Delete all existing variants and their images (cascade delete)
    await tx.productVariant.deleteMany({
      where: { productId: id },
    })

    // Recreate variants with images
    if (variants && variants.length > 0) {
      for (const v of variants) {
        try {
          const variant = await tx.productVariant.create({
            data: {
              order: v.order ?? 0,
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
            await tx.variantImage.createMany({
              data: v.images.map((img: any) => ({
                url: img.url,
                publicId: img.publicId,
                altText: img.altText || "",
                variantId: variant.id,
              })),
            })
          }
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            const target = error.meta?.target as string[] | undefined
            if (target?.includes("sku")) {
              throw new Error(
                "This SKU is already in use by another product or variant. Please choose a different SKU.",
              )
            }
          }
          throw error
        }
      }
    }
  })

  revalidatePath(`/admin/products/${id}`)
  revalidatePath(`/products/${slug || id}`)
  revalidatePath("/admin/products")
  return { success: true }
}

export async function deleteProduct(id: string) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.ADMIN)) {
    throw new Error("Unauthorized")
  }

  // Check if any variant of this product is referenced by an OrderItem.
  // The OrderItem → ProductVariant foreign key defaults to RESTRICT, so we
  // cannot delete a product whose variants appear on an order.
  const variantIds = await prisma.productVariant.findMany({
    where: { productId: id },
    select: { id: true },
  })

  if (variantIds.length > 0) {
    const orderItemCount = await prisma.orderItem.count({
      where: { variantId: { in: variantIds.map((v) => v.id) } },
    })

    if (orderItemCount > 0) {
      throw new Error(
        "Cannot delete a product that has been ordered. Mark it as inactive or change its status to ARCHIVED instead.",
      )
    }
  }

  // Clean up cart items and wishlist items that reference this product's
  // variants before deleting (these relations use CASCADE, but being
  // explicit avoids any edge-case issues).
  if (variantIds.length > 0) {
    const ids = variantIds.map((v) => v.id)
    await prisma.cartItem.deleteMany({ where: { variantId: { in: ids } } })
  }

  await prisma.wishlistItem.deleteMany({ where: { productId: id } })
  await prisma.product.delete({ where: { id } })
  revalidatePath("/admin/products")
}
