import Image from "next/image"
import Link from "next/link"
import { SeasonalCampaign as Campaign } from "@prisma/client"
import ProductGrid from "./ProductGrid"

interface SeasonalCampaignProps {
  campaign: Campaign & { featuredProducts: any[] }
}

export default function SeasonalCampaign({ campaign }: SeasonalCampaignProps) {
  const products = campaign.featuredProducts.map((fp: any) => fp.product)

  return (
    <section className="container mx-auto py-16">
      <div className="relative h-[300px] rounded-xl overflow-hidden mb-8">
        {campaign.banner && (
          <Image src={campaign.banner} alt={campaign.name} fill className="object-cover" />
        )}
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center">
          <h2 className="text-4xl font-serif mb-2">{campaign.name}</h2>
          <p className="text-lg mb-4">{campaign.description}</p>
          <Link href={`/campaigns/${campaign.slug}`} className="underline text-white font-medium">
            Explore Collection
          </Link>
        </div>
      </div>
      <ProductGrid products={products} />
    </section>
  )
}