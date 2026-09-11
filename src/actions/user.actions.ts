"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role } from "@prisma/client"
import bcrypt from "bcryptjs"

function ensureAdmin(session: Awaited<ReturnType<typeof getServerSession>>) {
  const role = (session as any)?.user?.role
  if (!role || (role !== Role.SUPER_ADMIN && role !== Role.ADMIN)) {
    throw new Error("Unauthorized")
  }
}

function isSuperAdmin(session: Awaited<ReturnType<typeof getServerSession>>): boolean {
  return (session as any)?.user?.role === Role.SUPER_ADMIN
}

// ---------------------------------------------------------------------------
// createUser
// ---------------------------------------------------------------------------
export async function createUser(data: {
  name: string
  email: string
  role: Role
  password: string
}) {
  const session = await getServerSession(authOptions)
  ensureAdmin(session)
  const email = data.email.trim().toLowerCase()

  // Only SUPER_ADMIN can create another SUPER_ADMIN
  if (data.role === Role.SUPER_ADMIN && !isSuperAdmin(session)) {
    throw new Error("Only a SUPER_ADMIN can create a SUPER_ADMIN account.")
  }

  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new Error("A user with this email already exists.")
  }

  if (data.password.length < 8) {
    throw new Error("Password must be at least 8 characters.")
  }

  const hashedPassword = await bcrypt.hash(data.password, 10)

  // Create the user with the hashed password
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email,
      password: hashedPassword,
      role: data.role,
    },
  })

  revalidatePath("/admin/users")

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  }
}

// ---------------------------------------------------------------------------
// updateUser
// ---------------------------------------------------------------------------
export async function updateUser(
  id: string,
  data: {
    name?: string
    email?: string
    role?: Role
    password?: string
  },
) {
  const session = await getServerSession(authOptions)
  ensureAdmin(session)

  // Fetch the target user to enforce role-assignment rules
  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) {
    throw new Error("User not found.")
  }

  // Only SUPER_ADMIN can assign SUPER_ADMIN role (or edit an existing SUPER_ADMIN)
  if (
    (data.role === Role.SUPER_ADMIN || target.role === Role.SUPER_ADMIN) &&
    !isSuperAdmin(session)
  ) {
    throw new Error("Only a SUPER_ADMIN can modify a SUPER_ADMIN account.")
  }

  // If email is changing, check uniqueness and clear emailVerified
  const updateData: any = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.role !== undefined) updateData.role = data.role
  if (data.password !== undefined && data.password.length > 0) {
    if (data.password.length < 8) {
      throw new Error("Password must be at least 8 characters.")
    }
    updateData.password = await bcrypt.hash(data.password, 10)
  }

  const normalizedEmail = data.email?.trim().toLowerCase()
  if (normalizedEmail !== undefined && normalizedEmail !== target.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })
    if (emailExists) {
      throw new Error("A user with this email already exists.")
    }
    updateData.email = normalizedEmail
    updateData.emailVerified = null // new email must be re-verified
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, emailVerified: true },
  })

  revalidatePath("/admin/users")
  return user
}

// ---------------------------------------------------------------------------
// deleteUser
// ---------------------------------------------------------------------------
export async function deleteUser(id: string) {
  const session = await getServerSession(authOptions)
  ensureAdmin(session)

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) {
    throw new Error("User not found.")
  }

  // SUPER_ADMIN cannot be deleted via UI (by anyone — direct DB access only)
  if (target.role === Role.SUPER_ADMIN) {
    throw new Error(
      "Cannot delete a SUPER_ADMIN account via the admin panel. " +
        "This action requires direct database access.",
    )
  }

  // ------------------------------------------------------------------
  // BLOCK checks — real historical data that must not be destroyed
  // ------------------------------------------------------------------

  // 1. Orders — financial records
  const orderCount = await prisma.order.count({ where: { userId: id } })
  if (orderCount > 0) {
    throw new Error(
      `Cannot delete this user — they have ${orderCount} order(s). ` +
        "Orders are financial records and cannot be deleted.",
    )
  }

  // 2. Reviews — public-facing content on product pages
  const reviewCount = await prisma.review.count({ where: { userId: id } })
  if (reviewCount > 0) {
    throw new Error(
      `Cannot delete this user — they have ${reviewCount} review(s) on products. ` +
        "Reviews are public content and cannot be deleted.",
    )
  }

  // ------------------------------------------------------------------
  // CASCADE / NULLIFY — relations that don't block deletion
  // ------------------------------------------------------------------
  // These cascade automatically via the schema (onDelete: Cascade):
  //   Account, Session, Address, WishlistItem, CartItem
  //
  // These have optional userId FKs — set them to null so audit trails
  // are preserved without the user reference:
  //   ActivityLog, AuditLog, InventoryLog

  await prisma.$transaction([
    prisma.activityLog.updateMany({
      where: { userId: id },
      data: { userId: null },
    }),
    prisma.auditLog.updateMany({
      where: { userId: id },
      data: { userId: null },
    }),
    prisma.inventoryLog.updateMany({
      where: { userId: id },
      data: { userId: null },
    }),
  ])

  // Now safe to delete — cascades will handle Account, Session, Address,
  // WishlistItem, CartItem automatically.
  await prisma.user.delete({ where: { id } })

  revalidatePath("/admin/users")
  return { success: true }
}