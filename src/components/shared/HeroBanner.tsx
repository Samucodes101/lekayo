import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface HeroBannerProps {
  headline: string
  subheadline?: string
  ctaText: string
  ctaLink: string
  image: string
}

export default function HeroBanner({ headline, subheadline, ctaText, ctaLink, image }: HeroBannerProps) {
  return (
    <div className="relative h-[600px] w-full">
      <Image src={image} alt={headline} fill className="object-cover" priority />
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
        <div className="text-center text-white space-y-4 max-w-2xl px-4">
          <h1 className="text-5xl font-serif font-bold">{headline}</h1>
          {subheadline && <p className="text-xl">{subheadline}</p>}
          <Button asChild size="lg" className="bg-white text-black hover:bg-gray-100">
            <Link href={ctaLink}>{ctaText}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}