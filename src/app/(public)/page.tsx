export const dynamic = "force-dynamic"

import { prisma } from "@/lib/db"
import HeroBanner from "@/components/shared/HeroBanner"
import ProductGrid from "@/components/shared/ProductGrid"
import ShopByBrand from "@/components/shared/ShopByBrand"
import SeasonalCampaign from "@/components/shared/SeasonalCampaign"
import StyleCollection from "@/components/shared/StyleCollection"
import Testimonials from "@/components/shared/Testimonials"
import Newsletter from "@/components/shared/Newsletter"
import ShopByCategory from "@/components/shared/ShopByCategory"
import { ProductWithVariants } from "@/types"
import { enrichProductsWithFlashSales } from "@/lib/flashSale"

export default async function HomePage() {
  // Fetch sections with order and visibility
  const sections = await prisma.homepageSection.findMany({
    orderBy: { order: "asc" },
  })
  const visibleSections = sections.filter(s => s.visible)

  // Fetch data
  const hero = await prisma.heroBanner.findFirst({ where: { active: true }, orderBy: { order: "asc" } })
  const rawFeatured = await prisma.product.findMany({
    where: { featured: true, status: "PUBLISHED" },
    take: 8,
    include: { variants: { include: { images: true, color: true } }, brand: true, category: true },
  })
  const rawNewArrivals = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { variants: { include: { images: true, color: true } }, brand: true, category: true },
  })

  // Enrich with flash sale prices
  const allProducts = [...rawFeatured, ...rawNewArrivals]
  const enriched = await enrichProductsWithFlashSales(allProducts as any)
  const enrichedMap = new Map(enriched.map(p => [p.id, p]))
  const featuredProducts = rawFeatured.map(p => enrichedMap.get(p.id) || p) as unknown as ProductWithVariants[]
  const newArrivals = rawNewArrivals.map(p => enrichedMap.get(p.id) || p) as unknown as ProductWithVariants[]

  const activeCampaign = await prisma.seasonalCampaign.findFirst({
    where: { active: true, startsAt: { lte: new Date() }, endsAt: { gte: new Date() } },
    include: { featuredProducts: { include: { product: { include: { variants: { include: { images: true, color: true } }, brand: true, category: true } } } } },
  })

  // Enrich campaign products with flash sales
  if (activeCampaign) {
    const campaignProducts = activeCampaign.featuredProducts.map(fp => fp.product)
    const enrichedCampaign = await enrichProductsWithFlashSales(campaignProducts as any)
    const campaignMap = new Map(enrichedCampaign.map(p => [p.id, p]))
    activeCampaign.featuredProducts.forEach(fp => {
      const enriched = campaignMap.get(fp.product.id)
      if (enriched) Object.assign(fp.product, enriched)
    })
  }

  const activeCollections = await prisma.styleCollection.findMany({
    where: { active: true },
    include: { products: { include: { product: { include: { variants: { include: { images: true, color: true } }, brand: true, category: true } } } } },
  })

  // Enrich collection products with flash sales
  for (const collection of activeCollections) {
    const colProducts = collection.products.map(cp => cp.product)
    const enrichedCol = await enrichProductsWithFlashSales(colProducts as any)
    const colMap = new Map(enrichedCol.map(p => [p.id, p]))
    collection.products.forEach(cp => {
      const enriched = colMap.get(cp.product.id)
      if (enriched) Object.assign(cp.product, enriched)
    })
  }
  const brands = await prisma.brand.findMany({ where: { featured: true }, orderBy: { order: "asc" } })
  const testimonials = await prisma.testimonial.findMany({ where: { approved: true }, orderBy: { order: "asc" } })
  const categories = await prisma.category.findMany({
    where: { featured: true },
    orderBy: { order: "asc" },
    take: 6,
  })

  // Map section types to components
  const sectionComponents: Record<string, JSX.Element | null> = {
    HERO: hero ? <HeroBanner key="hero" {...hero} /> : null,
    CATEGORIES: categories.length > 0 ? <ShopByCategory key="categories" categories={categories} /> : null,

    FEATURED_PRODUCTS: featuredProducts.length > 0 ? (
      <section key="featured" className="container mx-auto py-12">
        <h2 className="text-3xl font-serif mb-8">Featured Products</h2>
        <ProductGrid products={featuredProducts} />
      </section>
    ) : null,
    SHOP_BY_BRAND: brands.length > 0 ? <ShopByBrand key="brands" brands={brands} /> : null,
    SEASONAL_CAMPAIGN: activeCampaign ? <SeasonalCampaign key="campaign" campaign={activeCampaign} /> : null,
    STYLE_COLLECTIONS: activeCollections.length > 0 ? (
      <div key="collections">
        {activeCollections.map((collection) => (
          <StyleCollection key={collection.id} collection={collection} />
        ))}
      </div>
    ) : null,
    TESTIMONIALS: testimonials.length > 0 ? <Testimonials key="testimonials" testimonials={testimonials} /> : null,
    NEWSLETTER: <Newsletter key="newsletter" />,
  }

  // Render visible sections in order
  const components = visibleSections
    .map((section) => sectionComponents[section.sectionType] || null)
    .filter(Boolean)

  // If no sections or no components, render a default layout (fallback)
  if (components.length === 0) {
    return (
      <>
        {hero && <HeroBanner {...hero} />}
        {categories.length > 0 && <ShopByCategory categories={categories} />}
        {featuredProducts.length > 0 && (
          <section className="container mx-auto py-12">
            <h2 className="text-3xl font-serif mb-8">Featured Products</h2>
            <ProductGrid products={featuredProducts} />
          </section>
        )}
        <section className="container mx-auto py-12">
          <h2 className="text-3xl font-serif mb-8">New Arrivals</h2>
          <ProductGrid products={newArrivals} />
        </section>
        {activeCampaign && <SeasonalCampaign campaign={activeCampaign} />}
        {brands.length > 0 && <ShopByBrand brands={brands} />}
        {activeCollections.map((collection) => (
          <StyleCollection key={collection.id} collection={collection} />
        ))}
        {testimonials.length > 0 && <Testimonials testimonials={testimonials} />}
        <Newsletter />
      </>
    )
  }

  return <>{components}</>
}