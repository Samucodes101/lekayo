import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function seedHomepageSections() {
  const sections = [
    { sectionType: 'HERO', title: 'Hero Banner', order: 0, visible: true, config: {} },
    { sectionType: 'FEATURED_PRODUCTS', title: 'Featured Products', order: 1, visible: true, config: {} },
    { sectionType: 'SHOP_BY_BRAND', title: 'Shop By Brand', order: 2, visible: true, config: {} },
    { sectionType: 'SEASONAL_CAMPAIGN', title: 'Seasonal Campaign', order: 3, visible: true, config: {} },
    { sectionType: 'STYLE_COLLECTIONS', title: 'Style Collections', order: 4, visible: true, config: {} },
    { sectionType: 'NEWSLETTER', title: 'Newsletter', order: 5, visible: true, config: {} },
    { sectionType: 'TESTIMONIALS', title: 'Testimonials', order: 6, visible: true, config: {} },
  ]
  for (const s of sections) {
    const existing = await prisma.homepageSection.findFirst({ where: { sectionType: s.sectionType } })
    if (!existing) {
      await prisma.homepageSection.create({ data: s })
      console.log(`✅ Created homepage section: ${s.sectionType}`)
    }
  }
  console.log('🎉 Homepage sections seeded')
}

seedHomepageSections()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())