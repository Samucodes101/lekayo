import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ==========================================
  // 1. CREATE USERS (All Roles)
  // ==========================================
  const usersData = [
    { email: 'admin@lekayo.com', password: 'Admin123!', name: 'Super Admin', role: Role.SUPER_ADMIN },
    { email: 'dev@lekayo.com', password: 'Dev123!', name: 'Developer', role: Role.DEVELOPER },
    { email: 'manager@lekayo.com', password: 'Manager123!', name: 'Store Manager', role: Role.ADMIN },
    { email: 'cs@lekayo.com', password: 'Cs123!', name: 'Customer Service', role: Role.CUSTOMER_SERVICE },
    { email: 'inventory@lekayo.com', password: 'Inventory123!', name: 'Inventory Manager', role: Role.INVENTORY_MANAGER },
    { email: 'marketing@lekayo.com', password: 'Marketing123!', name: 'Marketing Manager', role: Role.MARKETING_MANAGER },
    { email: 'customer@lekayo.com', password: 'Customer123!', name: 'Test Customer', role: Role.CUSTOMER },
  ]

  for (const u of usersData) {
    const exists = await prisma.user.findUnique({ where: { email: u.email } })
    if (!exists) {
      await prisma.user.create({
        data: {
          email: u.email,
          password: await bcrypt.hash(u.password, 10),
          name: u.name,
          role: u.role,
          emailVerified: new Date(),
        },
      })
      console.log(`✅ Created user: ${u.email} (${u.role})`)
    }
  }

  // ==========================================
  // 2. CREATE BRANDS (Minimal for structure)
  // ==========================================
  const brands = [
    { name: 'Rolex', slug: 'rolex', description: 'Luxury Swiss watches', featured: true, order: 1 },
    { name: 'Cartier', slug: 'cartier', description: 'French luxury jewelry', featured: true, order: 2 },
  ]
  const brandMap: Record<string, any> = {}
  for (const b of brands) {
    const exists = await prisma.brand.findUnique({ where: { slug: b.slug } })
    if (!exists) {
      const created = await prisma.brand.create({ data: b })
      brandMap[b.slug] = created
      console.log(`✅ Created brand: ${b.name}`)
    } else {
      brandMap[b.slug] = exists
    }
  }

  // ==========================================
  // 3. CREATE CATEGORIES (Minimal for structure)
  // ==========================================
  const categoriesData = [
    { name: 'Watches', slug: 'watches', description: 'Elegant timepieces', featured: true, order: 1 },
    { name: 'Clothing', slug: 'clothing', description: 'Premium apparel', featured: true, order: 2 },
  ]
  const categoryMap: Record<string, any> = {}
  for (const c of categoriesData) {
    const exists = await prisma.category.findUnique({ where: { slug: c.slug } })
    if (!exists) {
      const created = await prisma.category.create({ data: c })
      categoryMap[c.slug] = created
      console.log(`✅ Created category: ${c.name}`)
    } else {
      categoryMap[c.slug] = exists
    }
  }

  // ==========================================
  // 4. CREATE SUBCATEGORIES
  // ==========================================
  const subcategories = [
    { name: 'Luxury Watches', slug: 'luxury-watches', categorySlug: 'watches' },
    { name: 'Sports Watches', slug: 'sports-watches', categorySlug: 'watches' },
    { name: 'Hoodies', slug: 'hoodies', categorySlug: 'clothing' },
    { name: 'Shirts', slug: 'shirts', categorySlug: 'clothing' },
  ]
  for (const sub of subcategories) {
    const category = categoryMap[sub.categorySlug]
    if (!category) continue
    const exists = await prisma.subcategory.findUnique({ where: { slug: sub.slug } })
    if (!exists) {
      await prisma.subcategory.create({
        data: {
          name: sub.name,
          slug: sub.slug,
          categoryId: category.id,
        },
      })
      console.log(`✅ Created subcategory: ${sub.name}`)
    }
  }

  // ==========================================
  // 5. CREATE COLORS
  // ==========================================
  const colors = [
    { name: 'Gold', hexCode: '#FFD700' },
    { name: 'Silver', hexCode: '#C0C0C0' },
    { name: 'Black', hexCode: '#000000' },
  ]
  const colorMap: Record<string, any> = {}
  for (const c of colors) {
    const exists = await prisma.color.findUnique({ where: { name: c.name } })
    if (!exists) {
      const created = await prisma.color.create({ data: c })
      colorMap[c.name] = created
      console.log(`✅ Created color: ${c.name}`)
    } else {
      colorMap[c.name] = exists
    }
  }

  // ==========================================
  // 6. CREATE SIZE SYSTEMS
  // ==========================================
  const sizeSystems = [
    { name: 'Watches', sizes: ['38mm', '40mm', '42mm', '44mm'] },
    { name: 'Clothing', sizes: ['XS', 'S', 'M', 'L', 'XL'] },
  ]
  const sizeSystemMap: Record<string, any> = {}
  for (const sys of sizeSystems) {
    const exists = await prisma.sizeSystem.findUnique({ where: { name: sys.name } })
    if (!exists) {
      const created = await prisma.sizeSystem.create({
        data: {
          name: sys.name,
          sizes: sys.sizes,
        },
      })
      sizeSystemMap[sys.name] = created
      console.log(`✅ Created size system: ${sys.name}`)
    } else {
      sizeSystemMap[sys.name] = exists
    }
  }

  // ==========================================
  // 7. CREATE ONE SAMPLE PRODUCT
  // ==========================================
  const watchCategory = categoryMap['watches']
  const rolexBrand = brandMap['rolex']
  const luxurySub = await prisma.subcategory.findFirst({ where: { slug: 'luxury-watches' } })
  const goldColor = colorMap['Gold']
  const watchSizeSystem = sizeSystemMap['Watches']

  if (watchCategory && rolexBrand && luxurySub && goldColor && watchSizeSystem) {
    const productExists = await prisma.product.findUnique({ where: { sku: 'RLX-SUB-001' } })
    if (!productExists) {
      const product = await prisma.product.create({
        data: {
          name: 'Rolex Submariner',
          slug: 'rolex-submariner',
          sku: 'RLX-SUB-001',
          description: 'Iconic dive watch, water-resistant to 300m. A masterpiece of precision and style.',
          basePrice: 1299.99,
          salePrice: 999.99,
          featured: true,
          status: 'PUBLISHED',
          tags: ['luxury', 'dive', 'sports'],
          materials: 'Stainless Steel, Sapphire Crystal',
          brandId: rolexBrand.id,
          categoryId: watchCategory.id,
          subcategoryId: luxurySub.id,
        },
      })
      console.log(`✅ Created sample product: ${product.name}`)
      
      
      // Create a variant for the product
      const variant = await prisma.productVariant.create({
        data: {
          sku: 'RLX-SUB-001-GLD-42',
          price: 999.99,
          stock: 15,
          productId: product.id,
          colorId: goldColor.id,
          sizeSystemId: watchSizeSystem.id,
          sizeValue: '42mm',
        },
      })
      console.log(`✅ Created variant: ${variant.sku}`)

      // Add a placeholder image for the variant
     // Ensure each variant has at least one image
    const variantImages: string[] = [] // Populate this array with your Cloudinary public IDs if available
        
    const imagesForVariant = variantImages.length > 0 ? variantImages : ['sample']
        
    for (const img of imagesForVariant) {
      await prisma.variantImage.create({
        data: {
          url: `https://res.cloudinary.com/demo/image/upload/v1312461204/${img}.jpg`,
          publicId: img,
          altText: `${product.name} - ${goldColor.name || 'default'}`,
          order: 0,
          variantId: variant.id,
        },
      })
    }

  console.log(`✅ Added ${imagesForVariant.length} image(s) to variant`)
      }
    }

  // ==========================================
  // 8. CREATE HERO BANNER
  // ==========================================
  const heroExists = await prisma.heroBanner.findFirst()
  if (!heroExists) {
    await prisma.heroBanner.create({
      data: {
        headline: 'Discover Timeless Elegance',
        subheadline: 'The finest selection of luxury watches, jewelry, and fashion.',
        ctaText: 'Shop Now',
        ctaLink: '/shop',
        image: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221200%22 height=%22600%22%3E%3Crect width=%221200%22 height=%22600%22 fill=%22%231a1a2e%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2236%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23ffffff%22 font-family=%22serif%22%3ELEKAYO%3C/text%3E%3C/svg%3E',
        active: true,
        order: 0,
      },
    })
    console.log('✅ Created Hero Banner')
  }

  // ==========================================
  // 9. CREATE PROMOTIONAL BANNERS
  // ==========================================
  const bannerExists = await prisma.promotionalBanner.findFirst()
  if (!bannerExists) {
    await prisma.promotionalBanner.createMany({
      data: [
        {
          image: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22300%22%3E%3Crect width=%22800%22 height=%22300%22 fill=%22%232d2d44%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2228%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23ffffff%22%3ESummer Sale%3C/text%3E%3C/svg%3E',
          link: '/shop',
          position: 'TOP',
          active: true,
          order: 0,
        },
        {
          image: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22300%22%3E%3Crect width=%22800%22 height=%22300%22 fill=%22%23442244%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2228%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23ffffff%22%3ENew Collection%3C/text%3E%3C/svg%3E',
          link: '/brands',
          position: 'MIDDLE',
          active: true,
          order: 1,
        },
      ],
    })
    console.log('✅ Created Promotional Banners')
  }

  // ==========================================
  // 10. CREATE SEASONAL CAMPAIGN
  // ==========================================
  const campaignExists = await prisma.seasonalCampaign.findFirst()
  if (!campaignExists) {
    await prisma.seasonalCampaign.create({
      data: {
        name: 'Summer Collection',
        slug: 'summer-collection',
        banner: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22400%22%3E%3Crect width=%22800%22 height=%22400%22 fill=%22%23006688%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2232%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23ffffff%22%3ESummer Vibes%3C/text%3E%3C/svg%3E',
        description: 'Explore our summer picks – light, breezy, and stylish.',
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        active: true,
      },
    })
    console.log('✅ Created Seasonal Campaign')
  }

  // ==========================================
  // 11. CREATE STYLE COLLECTION
  // ==========================================
  const collectionExists = await prisma.styleCollection.findFirst()
  if (!collectionExists) {
    await prisma.styleCollection.create({
      data: {
        name: 'Luxury Collection',
        slug: 'luxury-collection',
        description: 'The epitome of luxury – curated for the discerning.',
        active: true,
      },
    })
    console.log('✅ Created Style Collection')
  }

  // ==========================================
  // 12. CREATE TESTIMONIALS
  // ==========================================
  const testimonialExists = await prisma.testimonial.findFirst()
  if (!testimonialExists) {
    await prisma.testimonial.createMany({
      data: [
        {
          customerName: 'Emma Watson',
          review: 'Absolutely stunning pieces. The quality is unmatched.',
          rating: 5,
          photo: null,
          approved: true,
          order: 0,
        },
        {
          customerName: 'Daniel Craig',
          review: 'I love my new watch. The service was excellent.',
          rating: 5,
          photo: null,
          approved: true,
          order: 1,
        },
        {
          customerName: 'Priyanka Chopra',
          review: 'The necklace I ordered exceeded my expectations.',
          rating: 4,
          photo: null,
          approved: true,
          order: 2,
        },
      ],
    })
    console.log('✅ Created Testimonials')
  }

  // ==========================================
  // 13. CREATE GALLERY IMAGES
  // ==========================================
  const galleryExists = await prisma.homepageGalleryImage.findFirst()
  if (!galleryExists) {
    await prisma.homepageGalleryImage.createMany({
      data: [
        {
          image: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22%3E%3Crect width=%22300%22 height=%22300%22 fill=%22%23e8d5b7%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2220%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23665544%22%3EWatches%3C/text%3E%3C/svg%3E',
          link: '/shop/watches',
          altText: 'Luxury watches collection',
          order: 0,
        },
        {
          image: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22%3E%3Crect width=%22300%22 height=%22300%22 fill=%22%23d4c5b0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2220%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23665544%22%3EJewelry%3C/text%3E%3C/svg%3E',
          link: '/shop/rings',
          altText: 'Jewelry collection',
          order: 1,
        },
        {
          image: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22%3E%3Crect width=%22300%22 height=%22300%22 fill=%22%23f0e6d3%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2220%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23665544%22%3EFashion%3C/text%3E%3C/svg%3E',
          link: '/shop/clothing',
          altText: 'Fashion collection',
          order: 2,
        },
      ],
    })
    console.log('✅ Created Gallery Images')
  }

  // ==========================================
  // 14. CREATE WHOLESALE CONTENT
  // ==========================================
  const wholesaleExists = await prisma.setting.findUnique({ where: { key: 'wholesale' } })
  if (!wholesaleExists) {
    await prisma.setting.create({
      data: {
        key: 'wholesale',
        value: {
          description: 'Partner with Lekayo to offer luxury fashion to your customers. Enjoy exclusive pricing, dedicated support, and early access to new collections.',
          telegramLink: 'https://t.me/lekayo_wholesale',
          requirements: 'Minimum order of 10 items per style. Valid business registration required.',
        },
      },
    })
    console.log('✅ Created Wholesale Content')
  }

  // ==========================================
  // 15. CREATE HOMEPAGE SECTIONS (ALL)
  // ==========================================
  const sectionTypes = [
    'HERO',
    'FEATURED_PRODUCTS',
    'SHOP_BY_BRAND',
    'SEASONAL_CAMPAIGN',
    'STYLE_COLLECTIONS',
    'NEWSLETTER',
    'TESTIMONIALS',
    'CATEGORIES',
    'GALLERY',
    'EDITORIAL',
    'PROMO_BANNERS',
  ]

  for (const [idx, type] of sectionTypes.entries()) {
    const exists = await prisma.homepageSection.findFirst({ where: { sectionType: type } })
    if (!exists) {
      await prisma.homepageSection.create({
        data: {
          sectionType: type,
          title: type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase()),
          order: idx,
          visible: true,
          config: {},
        },
      })
      console.log(`✅ Created homepage section: ${type}`)
    }
  }

  // ==========================================
  // 16. CREATE COUPONS
  // ==========================================
  const couponExists = await prisma.coupon.findFirst()
  if (!couponExists) {
    await prisma.coupon.create({
      data: {
        code: 'WELCOME10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderAmount: 50,
        maxDiscount: 50,
        usageLimit: 100,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        active: true,
      },
    })
    console.log('✅ Created coupon: WELCOME10')
  }

  // ==========================================
  // 17. CREATE FLASH SALE
  // ==========================================
  const flashSaleExists = await prisma.flashSale.findFirst()
  if (!flashSaleExists) {
    await prisma.flashSale.create({
      data: {
        name: 'Weekend Flash Sale',
        slug: 'weekend-flash-sale',
        description: 'Up to 30% off selected items this weekend!',
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        active: true,
      },
    })
    console.log('✅ Created Flash Sale')
  }

  // ==========================================
  // 18. CREATE ADDRESS FOR CUSTOMER
  // ==========================================
  const customerUser = await prisma.user.findUnique({ where: { email: 'customer@lekayo.com' } })
  if (customerUser) {
    const addressExists = await prisma.address.findFirst({ where: { userId: customerUser.id } })
    if (!addressExists) {
      await prisma.address.create({
        data: {
          firstName: 'Test',
          lastName: 'Customer',
          addressLine1: '123 Lekayo Street',
          city: 'Lagos',
          state: 'Lagos',
          postalCode: '100001',
          country: 'Nigeria',
          phone: '+234 800 123 4567',
          isDefault: true,
          userId: customerUser.id,
        },
      })
      console.log('✅ Created address for customer user')
    }
  }

  console.log('🎉 Seed completed successfully!')
  console.log('✅ All homepage sections are created.')
  console.log('✅ You can now log in and manage content via the admin panel.')
  console.log('📌 Default credentials: admin@lekayo.com / Admin123!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

export {}