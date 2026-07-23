import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function createUser(email: string, password: string, name: string, role: Role) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log(`Skipped (already exists): ${email}`)
    return
  }

  await prisma.user.create({
    data: {
      email,
      password: await bcrypt.hash(password, 10),
      name,
      role,
      emailVerified: new Date(),
    },
  })

  console.log(`Created: ${email} (${role})`)
}

async function main() {
  // ---- Super Admin ----
  await createUser(
    "admin@lekayo.com",
    "PASTE_STRONG_PASSWORD_HERE", // openssl rand -base64 18
    "Super Admin",
    Role.SUPER_ADMIN
  )

  // ---- Uncomment + fill in only the ones you actually need right now ----

  // await createUser(
  //   "dev@lekayo.com",
  //   "PASTE_STRONG_PASSWORD_HERE",
  //   "Developer",
  //   Role.DEVELOPER
  // )

  // await createUser(
  //   "manager@lekayo.com",
  //   "PASTE_STRONG_PASSWORD_HERE",
  //   "Store Manager",
  //   Role.ADMIN
  // )

  // await createUser(
  //   "cs@lekayo.com",
  //   "PASTE_STRONG_PASSWORD_HERE",
  //   "Customer Service",
  //   Role.CUSTOMER_SERVICE
  // )

  // await createUser(
  //   "inventory@lekayo.com",
  //   "PASTE_STRONG_PASSWORD_HERE",
  //   "Inventory Manager",
  //   Role.INVENTORY_MANAGER
  // )

  // await createUser(
  //   "marketing@lekayo.com",
  //   "PASTE_STRONG_PASSWORD_HERE",
  //   "Marketing Manager",
  //   Role.MARKETING_MANAGER
  // )
}

main()
  .catch((e) => {
    console.error("Failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
