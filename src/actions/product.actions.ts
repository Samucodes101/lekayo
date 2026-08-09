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

    // Fetch existing variant IDs for this product
    const existingVariants = await tx.productVariant.findMany({
      where: { productId: id },
      select: { id: true, sku: true },
    })
    const existingIds = existingVariants.map((v) => v.id)

    // Submitted variant IDs (those with an id matching an existing variant)
    const submittedIds = (variants || [])
      .filter((v: any) => v.id && existingIds.includes(v.id))
      .map((v: any) => v.id)

    // Variants that exist in DB but are NOT in the submitted list (admin removed them)
    const removedIds = existingIds.filter((eid) => !submittedIds.includes(eid))

    // --- EARLY VALIDATION: Check removed variants for order history ---
    if (removedIds.length > 0) {
      const orderCounts = await tx.orderItem.groupBy({
        by: ["variantId"],
        where: { variantId: { in: removedIds } },
        _count: { id: true },
      })

      if (orderCounts.length > 0) {
        const blockedSkus = existingVariants
          .filter((v) => orderCounts.some((oc) => oc.variantId === v.id))
          .map((v) => v.sku)

        throw new Error(
          `Cannot remove variant${blockedSkus.length > 1 ? "s" : ""} "${blockedSkus.join(", ")}" — ` +
          `${blockedSkus.length > 1 ? "they have" : "it has"} order history. ` +
          `To hide ${blockedSkus.length > 1 ? "them" : "it"} from customers, set stock to 0 ` +
          `instead of removing ${blockedSkus.length > 1 ? "them" : "it"}.`,
        )
      }
    }

    // --- RECONCILE: Update existing variants, create new ones ---
    if (variants && variants.length > 0) {
      for (const v of variants) {
        if (v.id && existingIds.includes(v.id)) {
          // EXISTING VARIANT — UPDATE in place
          try {
            await tx.productVariant.update({
              where: { id: v.id },
              data: {
                order: v.order ?? 0,
                sku: v.sku,
                stock: v.stock,
                price: v.price ?? null,
                colorId: v.colorId ?? null,
                sizeValue: v.sizeValue ?? null,
              },
            })

            // Reconcile images: diff existing vs submitted by publicId
            const existingImages = await tx.variantImage.findMany({
              where: { variantId: v.id },
              select: { id: true, publicId: true },
            })
            const existingPublicIds = existingImages.map((img) => img.publicId)
            const submittedPublicIds = (v.images || []).map((img: any) => img.publicId)

            // Delete images that were removed from the form
            for (const existingImg of existingImages) {
              if (!submittedPublicIds.includes(existingImg.publicId)) {
                // TODO(cloudinary-cleanup): The Cloudinary asset (publicId) is NOT deleted here.
                // This creates an orphaned file in Cloudinary. A future task should handle
                // cleaning up these orphaned assets.
                await tx.variantImage.delete({ where: { id: existingImg.id } })
              }
            }

            // Create images that are new (publicId not in existing set)
            for (const img of v.images || []) {
              if (!existingPublicIds.includes(img.publicId)) {
                await tx.variantImage.create({
                  data: {
                    url: img.url,
                    publicId: img.publicId,
                    altText: img.altText || "",
                    variantId: v.id,
                  },
                })
              }
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
        } else {
          // NEW VARIANT — CREATE
          try {
            const newVariant = await tx.productVariant.create({
              data: {
                order: v.order ?? 0,
                sku: v.sku,
                stock: v.stock,
                price: v.price ?? null,
                colorId: v.colorId ?? null,
                sizeValue: v.sizeValue ?? null,
                productId: id,
              },
            })

            // Create images for the new variant
            if (v.images && v.images.length > 0) {
              await tx.variantImage.createMany({
                data: v.images.map((img: any) => ({
                  url: img.url,
                  publicId: img.publicId,
                  altText: img.altText || "",
                  variantId: newVariant.id,
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
    }

    // --- REMOVE variants that passed the order-history check (removedIds with no orders) ---
    for (const removedId of removedIds) {
      // Clean up cart items referencing this variant before deleting
      await tx.cartItem.deleteMany({ where: { variantId: removedId } })

      // TODO(cloudinary-cleanup): Deleting the variant cascades to VariantImage rows,
      // but the Cloudinary assets (by publicId) are NOT deleted. A future task should
      // handle cleaning up these orphaned Cloudinary files.
      await tx.productVariant.delete({ where: { id: removedId } })
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
