"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role } from "@prisma/client"
import { generateSlug } from "@/lib/utils"
import { toActionError, type ActionResult } from "@/lib/actionResult"

// These actions return { ok, error } instead of throwing — see lib/actionResult.ts

async function isProductManager() {
  const session = await getServerSession(authOptions)
  return session?.user.role === Role.SUPER_ADMIN || session?.user.role === Role.ADMIN
}

const UNAUTHORIZED = { ok: false as const, error: "You don't have permission to manage products." }

export async function createProduct(data: any): Promise<ActionResult<{ id: string; slug: string }>> {
  if (!(await isProductManager())) return UNAUTHORIZED

  const { variants, ...productData } = data

  try {
    const product = await prisma.product.create({
      data: {
        ...productData,
        slug: generateSlug(productData.name),
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
      select: { id: true, slug: true },
    })

    revalidatePath("/admin/products")
    revalidatePath("/shop")
    return { ok: true, data: product }
  } catch (error) {
    return toActionError(error, "createProduct")
  }
}

export async function updateProduct(id: string, data: any): Promise<ActionResult> {
  if (!(await isProductManager())) return UNAUTHORIZED

  const { variants, ...productData } = data
  const slug = generateSlug(productData.name)

  try {
    await prisma.$transaction(async (tx) => {
      // Update product basic info
      await tx.product.update({
        where: { id },
        data: {
          ...productData,
          slug,
        },
      })

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

      // --- RECONCILE: Update existing variants, create new ones ---
      for (const v of variants || []) {
        if (v.id && existingIds.includes(v.id)) {
          // EXISTING VARIANT — UPDATE in place
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
        } else {
          // NEW VARIANT — CREATE
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
        }
      }

      // --- REMOVE variants: hard-delete only when there is no order/inventory history,
      // otherwise archive (isActive = false) to preserve the audit trail. ---
      for (const removedId of removedIds) {
        const [orderItemCount, inventoryLogCount] = await Promise.all([
          tx.orderItem.count({ where: { variantId: removedId } }),
          tx.inventoryLog.count({ where: { variantId: removedId } }),
        ])

        if (orderItemCount > 0 || inventoryLogCount > 0) {
          // Preserve order/inventory history: archive instead of hard-deleting.
          await tx.productVariant.update({
            where: { id: removedId },
            data: { isActive: false },
          })
        } else {
          // No history - safe to hard delete.
          // Clean up cart items referencing this variant before deleting.
          await tx.cartItem.deleteMany({ where: { variantId: removedId } })

          // TODO(cloudinary-cleanup): Deleting the variant cascades to VariantImage rows,
          // but the Cloudinary assets (by publicId) are NOT deleted. A future task should
          // handle cleaning up these orphaned Cloudinary files.
          await tx.productVariant.delete({ where: { id: removedId } })
        }
      }
    })
  } catch (error) {
    return toActionError(error, "updateProduct")
  }

  revalidatePath(`/admin/products/${id}`)
  revalidatePath(`/products/${slug || id}`)
  revalidatePath("/admin/products")
  return { ok: true, data: undefined }
}

export async function deleteProduct(id: string): Promise<ActionResult<{ archived: boolean }>> {
  if (!(await isProductManager())) return UNAUTHORIZED

  try {
    const variants = await prisma.productVariant.findMany({
      where: { productId: id },
      select: { id: true },
    })
    const variantIds = variants.map((v) => v.id)

    // OrderItem -> ProductVariant and InventoryLog -> ProductVariant are both RESTRICT.
    // If any variant has order or inventory history, we cannot cascade-delete it,
    // so archive the product and all of its variants instead of hard-deleting.
    const [orderItemCount, inventoryLogCount] = await Promise.all([
      variantIds.length > 0
        ? prisma.orderItem.count({ where: { variantId: { in: variantIds } } })
        : Promise.resolve(0),
      variantIds.length > 0
        ? prisma.inventoryLog.count({ where: { variantId: { in: variantIds } } })
        : Promise.resolve(0),
    ])

    if (orderItemCount > 0 || inventoryLogCount > 0) {
      await prisma.$transaction([
        prisma.product.update({ where: { id }, data: { status: "ARCHIVED" } }),
        prisma.productVariant.updateMany({ where: { productId: id }, data: { isActive: false } }),
      ])
      revalidatePath("/admin/products")
      return { ok: true, data: { archived: true } }
    }

    // No history - safe to hard delete (Product -> ProductVariant cascades).
    // Clean up cart items and wishlist items explicitly before deleting.
    if (variantIds.length > 0) {
      await prisma.cartItem.deleteMany({ where: { variantId: { in: variantIds } } })
    }

    await prisma.wishlistItem.deleteMany({ where: { productId: id } })
    await prisma.product.delete({ where: { id } })
    revalidatePath("/admin/products")
    return { ok: true, data: { archived: false } }
  } catch (error) {
    return toActionError(error, "deleteProduct")
  }
}
