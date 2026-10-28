import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { getShopUrl } from "@/lib/utils"

interface FooterProps {
  categories?: { id: string; name: string; slug: string }[]
}

const staticLinks = {
  Support: [
    { name: "Contact", href: "/contact" },
    { name: "Shipping Policy", href: "/shipping-policy" },
    { name: "Refund Policy", href: "/refund-policy" },
    { name: "Track an Order", href: "/orders/track" },
  ],
  Company: [
    { name: "About", href: "/about" },
    { name: "Brands", href: "/brands" },
    { name: "Gallery", href: "/gallery" },
    { name: "Wholesale", href: "/wholesale" },
  ],
}

export default function Footer({ categories = [] }: FooterProps) {
  const shopLinks = [
    { name: "All Products", href: "/shop" },
    ...categories.slice(0, 5).map((c) => ({ name: c.name, href: getShopUrl(c.slug) })),
  ]
  const columns = { Shop: shopLinks, ...staticLinks }

  return (
    <footer className="site-footer relative mt-20 overflow-hidden bg-neutral-950 text-white">
      {/* Soft top light so the dark block doesn't read as a flat slab */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-white/[0.04] blur-3xl" />

      <div className="relative px-6 sm:px-12 lg:px-20">
        {/* Statement row */}
        <div className="flex flex-col gap-8 border-b border-white/10 py-16 md:flex-row md:items-end md:justify-between lg:py-20">
          <h2 className="max-w-xl text-4xl font-semibold leading-[1] tracking-tight sm:text-5xl lg:text-6xl">
            Timeless pieces,
            <br />
            <span className="font-light text-white/50">made for you.</span>
          </h2>
          <Link
            href="/shop"
            className="group/cta inline-flex w-fit items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-medium uppercase tracking-[0.15em] text-black transition-all hover:bg-white/90 hover:shadow-[0_0_40px_-6px_rgba(255,255,255,0.45)]"
          >
            Shop the Collection
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-300 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5"
              strokeWidth={2}
            />
          </Link>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 py-14 md:grid-cols-12">
          <div className="col-span-2 md:col-span-4">
            <Image
              src="/logo.png"
              alt="Lekayo"
              width={330}
              height={84}
              className="h-8 w-auto brightness-0 invert" // dark logo rendered white on the dark footer
            />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/50">
              Curated watches, jewellery and fashion from the brands you love — delivered across Nigeria.
            </p>
          </div>

          {Object.entries(columns).map(([title, links]) => (
            <div key={title} className="md:col-span-2 md:[&:nth-child(2)]:col-start-7">
              <h4 className="mb-5 text-[11px] font-medium uppercase tracking-[0.25em] text-white/40">{title}</h4>
              <ul className="space-y-1">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group/link inline-flex min-h-[44px] items-center text-sm text-white/70 transition-colors hover:text-white md:min-h-0 md:py-1.5"
                    >
                      <span className="bg-gradient-to-r from-white to-white bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-300 group-hover/link:bg-[length:100%_1px]">
                        {link.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 border-t border-white/10 py-8 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Lekayo. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="transition-colors hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="transition-colors hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>

      {/* Oversized wordmark bleeding off the bottom edge */}
      <div aria-hidden="true" className="pointer-events-none select-none px-6 sm:px-12 lg:px-20">
        <p className="-mb-[0.22em] bg-gradient-to-b from-white/[0.09] to-transparent bg-clip-text text-[22vw] font-semibold leading-none tracking-tighter text-transparent">
          lekayo
        </p>
      </div>
    </footer>
  )
}
