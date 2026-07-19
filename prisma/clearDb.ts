import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearDatabase() {
  console.log('🧹 Starting database cleanup...')

  // Delete in reverse order of dependencies to avoid foreign key conflicts

  // Order items and cart items – depend on variants and orders
  await prisma.orderItem.deleteMany({})
  console.log('  ✅ Deleted OrderItems')

  await prisma.cartItem.deleteMany({})
  console.log('  ✅ Deleted CartItems')

  // Orders – depend on users and addresses
  await prisma.order.deleteMany({})
  console.log('  ✅ Deleted Orders')

  // Addresses – depend on users
  await prisma.address.deleteMany({})
  console.log('  ✅ Deleted Addresses')

  // Wishlist – depend on users and products
  await prisma.wishlistItem.deleteMany({})
  console.log('  ✅ Deleted WishlistItems')

  // Reviews – depend on users and products
  await prisma.review.deleteMany({})
  console.log('  ✅ Deleted Reviews')

  // Inventory logs – depend on variants
  await prisma.inventoryLog.deleteMany({})
  console.log('  ✅ Deleted InventoryLogs')

  // Flash sale products – depend on flash sales and products
  await prisma.flashSaleProduct.deleteMany({})
  console.log('  ✅ Deleted FlashSaleProducts')

  // Seasonal campaign products – depend on campaigns and products
  await prisma.seasonalCampaignProduct.deleteMany({})
  console.log('  ✅ Deleted SeasonalCampaignProducts')

  // Style collection products – depend on collections and products
  await prisma.styleCollectionProduct.deleteMany({})
  console.log('  ✅ Deleted StyleCollectionProducts')

  // Editorial block products – depend on editorial blocks and products
  await prisma.editorialBlockProduct.deleteMany({})
  console.log('  ✅ Deleted EditorialBlockProducts')

  // Homepage featured products – depend on products
  await prisma.homepageFeaturedProduct.deleteMany({})
  console.log('  ✅ Deleted HomepageFeaturedProducts')

  // Variant images – depend on variants
  await prisma.variantImage.deleteMany({})
  console.log('  ✅ Deleted VariantImages')

  // Product variants – depend on products
  await prisma.productVariant.deleteMany({})
  console.log('  ✅ Deleted ProductVariants')

  // Products – depend on brands, categories, subcategories
  await prisma.product.deleteMany({})
  console.log('  ✅ Deleted Products')

  // Subcategories – depend on categories
  await prisma.subcategory.deleteMany({})
  console.log('  ✅ Deleted Subcategories')

  // Categories
  await prisma.category.deleteMany({})
  console.log('  ✅ Deleted Categories')

  // Brands
  await prisma.brand.deleteMany({})
  console.log('  ✅ Deleted Brands')

  // Colors – no dependencies (can be deleted any time)
  await prisma.color.deleteMany({})
  console.log('  ✅ Deleted Colors')

  // Size systems – no dependencies
  await prisma.sizeSystem.deleteMany({})
  console.log('  ✅ Deleted SizeSystems')

  // Coupons
  await prisma.coupon.deleteMany({})
  console.log('  ✅ Deleted Coupons')

  // Flash sales
  await prisma.flashSale.deleteMany({})
  console.log('  ✅ Deleted FlashSales')

  // Seasonal campaigns
  await prisma.seasonalCampaign.deleteMany({})
  console.log('  ✅ Deleted SeasonalCampaigns')

  // Style collections
  await prisma.styleCollection.deleteMany({})
  console.log('  ✅ Deleted StyleCollections')

  // Editorial blocks
  await prisma.editorialBlock.deleteMany({})
  console.log('  ✅ Deleted EditorialBlocks')

  // Testimonials
  await prisma.testimonial.deleteMany({})
  console.log('  ✅ Deleted Testimonials')

  // Promotional banners
  await prisma.promotionalBanner.deleteMany({})
  console.log('  ✅ Deleted PromotionalBanners')

  // Hero banners
  await prisma.heroBanner.deleteMany({})
  console.log('  ✅ Deleted HeroBanners')

  // Homepage sections
  await prisma.homepageSection.deleteMany({})
  console.log('  ✅ Deleted HomepageSections')

  // Gallery images
  await prisma.homepageGalleryImage.deleteMany({})
  console.log('  ✅ Deleted GalleryImages')

  // Newsletter subscribers
  await prisma.newsletterSubscriber.deleteMany({})
  console.log('  ✅ Deleted NewsletterSubscribers')

  // Wholesale applications
  await prisma.wholesaleApplication.deleteMany({})
  console.log('  ✅ Deleted WholesaleApplications')

  // Audit logs and activity logs – we can keep or delete
  // If you want to keep audit trail, comment these out
  await prisma.auditLog.deleteMany({})
  console.log('  ✅ Deleted AuditLogs')

  await prisma.activityLog.deleteMany({})
  console.log('  ✅ Deleted ActivityLogs')

  // Settings – keep if you want to preserve site settings
  // If you want to reset settings, uncomment:
  // await prisma.setting.deleteMany({})
  // console.log('  ✅ Deleted Settings')

  // Inventory logs, audit logs, activity logs – already deleted above

  // IMPORTANT: We do NOT delete User, Account, Session
  // This preserves all user accounts and their authentication data

  console.log('🎉 Database cleaned! All users preserved.')
  console.log('   User tables kept: User, Account, Session')
  console.log('   All other data removed.')
}

clearDatabase()
  .catch((e) => {
    console.error('❌ Error during cleanup:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })