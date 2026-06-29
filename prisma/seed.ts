import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create default admin
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@lekayo.com'
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123!'
  const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!adminExists) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: await bcrypt.hash(adminPassword, 10),
        name: 'Super Admin',
        role: Role.SUPER_ADMIN,
        emailVerified: new Date(),
      },
    })
    console.log(`✅ Created super admin: ${adminEmail}`)
  }

  // Create developer
  const devEmail = process.env.DEFAULT_DEVELOPER_EMAIL || 'dev@lekayo.com'
  const devPassword = process.env.DEFAULT_DEVELOPER_PASSWORD || 'Dev123!'
  const devExists = await prisma.user.findUnique({ where: { email: devEmail } })
  if (!devExists) {
    await prisma.user.create({
      data: {
        email: devEmail,
        password: await bcrypt.hash(devPassword, 10),
        name: 'Developer',
        role: Role.DEVELOPER,
        emailVerified: new Date(),
      },
    })
    console.log(`✅ Created developer: ${devEmail}`)
  }

  // Create sample brand, category, product (optional, but recommended for testing)
  const brand = await prisma.brand.upsert({
    where: { slug: 'lekayo-luxury' },
    update: {},
    create: {
      name: 'Lekayo Luxury',
      slug: 'lekayo-luxury',
      description: 'Premium fashion brand',
      featured: true,
      order: 1,
    },
  })

  const category = await prisma.category.upsert({
    where: { slug: 'watches' },
    update: {},
    create: {
      name: 'Watches',
      slug: 'watches',
      description: 'Elegant timepieces',
      featured: true,
      order: 1,
    },
  })

  const subcategory = await prisma.subcategory.upsert({
    where: { slug: 'luxury-watches' },
    update: {},
    create: {
      name: 'Luxury Watches',
      slug: 'luxury-watches',
      categoryId: category.id,
    },
  })

  const color = await prisma.color.upsert({
    where: { name: 'Gold' },
    update: {},
    create: { name: 'Gold', hexCode: '#FFD700' },
  })

  const sizeSystem = await prisma.sizeSystem.upsert({
    where: { name: 'Watches' },
    update: {},
    create: {
      name: 'Watches',
      sizes: ['38mm', '40mm', '42mm', '44mm'],
    },
  })

  const product = await prisma.product.upsert({
    where: { sku: 'LK-WATCH-001' },
    update: {},
    create: {
      name: 'Lekayo Apex Chronograph',
      slug: 'lekayo-apex-chronograph',
      sku: 'LK-WATCH-001',
      description: 'A masterpiece of precision and style.',
      basePrice: 1299.99,
      salePrice: 999.99,
      featured: true,
      status: 'PUBLISHED',
      brandId: brand.id,
      categoryId: category.id,
      subcategoryId: subcategory.id,
      tags: ['luxury', 'gold', 'chronograph'],
      materials: 'Stainless Steel, Sapphire Crystal',
    },
  })

  // Add a variant
  const variant = await prisma.productVariant.upsert({
    where: { sku: 'LK-WATCH-001-GLD-42' },
    update: {},
    create: {
      sku: 'LK-WATCH-001-GLD-42',
      price: 999.99,
      stock: 15,
      productId: product.id,
      colorId: color.id,
      sizeSystemId: sizeSystem.id,
      sizeValue: '42mm',
    },
  })

  // Add variant image
  await prisma.variantImage.upsert({
    where: { id: 'sample-image' },
    update: {},
    create: {
      url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
      publicId: 'sample',
      altText: 'Lekayo watch gold',
      variantId: variant.id,
      order: 0,
    },
  })

  console.log('✅ Seeding complete.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })