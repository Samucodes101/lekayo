import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding production-safe reference data...')

  // ==========================================
  // HOMEPAGE SECTIONS (FIXED LIST — 8 wired types)
  // The homepage render logic depends on these
  // structural rows existing. No demo content,
  // no test users, no fixtures.
  // ==========================================
  const sectionTypes = [
    'HERO',
    'CATEGORIES',
    'FEATURED_PRODUCTS',
    'SHOP_BY_BRAND',
    'SEASONAL_CAMPAIGN',
    'STYLE_COLLECTIONS',
    'TESTIMONIALS',
    'NEWSLETTER',
  ]

  for (const [idx, type] of sectionTypes.entries()) {
    await prisma.homepageSection.upsert({
      where: { sectionType: type },
      update: {}, // never overwrite admin's order/visibility on re-run
      create: {
        sectionType: type,
        title: type
          .replace(/_/g, ' ')
          .toLowerCase()
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        order: idx,
        visible: true,
      },
    })
    console.log(`✅ Upserted homepage section: ${type}`)
  }

  console.log('🎉 Production seed completed successfully!')
  console.log('✅ All homepage sections are in place.')
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