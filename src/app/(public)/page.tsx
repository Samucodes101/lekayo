import { prisma } from "@/lib/db"
import HeroBanner from "@/components/shared/HeroBanner"
import ProductGrid from "@/components/shared/ProductGrid"
import ShopByBrand from "@/components/shared/ShopByBrand"
import SeasonalCampaign from "@/components/shared/SeasonalCampaign"
import StyleCollection from "@/components/shared/StyleCollection"
import Testimonials from "@/components/shared/Testimonials"
import Newsletter from "@/components/shared/Newsletter"

export default async function HomePage() {
  // Fetch all CMS-driven sections
  const hero = await prisma.heroBanner.findFirst({ where: { active: true }, orderBy: { order: "asc" } })
  const featuredProducts = await prisma.product.findMany({
    where: { featured: true, status: "PUBLISHED" },
    take: 8,
    include: { variants: { include: { images: true } }, brand: true },
  })
  const newArrivals = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { variants: { include: { images: true } }, brand: true },
  })
  const activeCampaign = await prisma.seasonalCampaign.findFirst({
    where: { active: true, startsAt: { lte: new Date() }, endsAt: { gte: new Date() } },
    include: {
      featuredProducts: {
        include: {
          product: {
            include: {
              variants: { include: { images: true } },
              brand: true,
            },
          },
        },
      },
    },
  })
  const activeCollections = await prisma.styleCollection.findMany({
    where: { active: true },
    include: {
      products: {
        include: {
          product: {
            include: {
              variants: { include: { images: true } },
            },
          },
        },
      },
    },
  })
  const brands = await prisma.brand.findMany({ where: { featured: true }, orderBy: { order: "asc" } })
  const testimonials = await prisma.testimonial.findMany({ where: { approved: true }, orderBy: { order: "asc" } })

  return (
    <>
      {hero && <HeroBanner {...hero} />}
      <section className="container mx-auto py-12">
        <h2 className="text-3xl font-serif mb-8">Featured Products</h2>
        <ProductGrid products={featuredProducts} />
      </section>
      <section className="container mx-auto py-12">
        <h2 className="text-3xl font-serif mb-8">New Arrivals</h2>
        <ProductGrid products={newArrivals} />
      </section>
      {activeCampaign && <SeasonalCampaign campaign={activeCampaign} />}
      <ShopByBrand brands={brands} />
      {activeCollections.map((collection) => (
        <StyleCollection key={collection.id} collection={collection} />
      ))}
      <Testimonials testimonials={testimonials} />
      <Newsletter />
    </>
  )
}