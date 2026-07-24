import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

interface HeroBannerProps {
  headline: string
  subheadline?: string | null
  eyebrow?: string | null
  ctaText: string
  ctaLink: string
  image: string
}

export default function HeroBanner({
  headline,
  subheadline,
  eyebrow,
  ctaText,
  ctaLink,
  image,
}: HeroBannerProps) {
  return (
    <div className="group relative h-[85vh] min-h-[560px] w-full overflow-hidden bg-black">
      <Image
        src={image}
        alt={headline}
        fill
        priority
        className="object-cover object-center scale-105 transition-transform duration-[6000ms] ease-out group-hover:scale-110 motion-safe:animate-[kenburns_10s_ease-out_forwards]"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

      <div className="relative z-10 flex h-full w-full flex-col justify-end px-6 pb-16 sm:px-12 sm:pb-20 lg:px-20">
        <div className="max-w-2xl space-y-5">
          {eyebrow && (
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-white/70 animate-[fadeUp_0.8s_ease-out]">
              {eyebrow}
            </p>
          )}

          <h1 className="text-4xl font-semibold uppercase leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl animate-[fadeUp_0.8s_ease-out_0.1s_backwards]">
            {headline}
          </h1>

          {subheadline && (
            <p className="max-w-md text-base font-light text-white/80 sm:text-lg animate-[fadeUp_0.8s_ease-out_0.2s_backwards]">
              {subheadline}
            </p>
          )}

          <div className="pt-2 animate-[fadeUp_0.8s_ease-out_0.3s_backwards]">
            <Link
              href={ctaLink}
              className="group/cta inline-flex items-center gap-2 border-b border-white/40 pb-1 text-sm font-medium uppercase tracking-[0.15em] text-white transition-colors hover:border-white"
            >
              {ctaText}
              <ArrowUpRight
                className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
                strokeWidth={2}
              />
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 sm:block">
        <div className="h-8 w-px bg-white/40 animate-pulse" />
      </div>
    </div>
  )
}