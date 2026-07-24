import Link from "next/link"
import Image from "next/image"

const footerLinks = {
  Shop: [
    { name: "Watches", href: "/shop/watches" },
    { name: "Rings", href: "/shop/rings" },
    { name: "Necklaces", href: "/shop/necklaces" },
    { name: "Clothing", href: "/shop/clothing" },
    { name: "Shoes", href: "/shop/shoes" },
  ],
  Support: [
    { name: "Contact", href: "/contact" },
    { name: "FAQs", href: "/faq" },
    { name: "Shipping & Returns", href: "/shipping-returns" },
    { name: "Size Guide", href: "/size-guide" },
  ],
  Company: [
    { name: "About", href: "/about" },
    { name: "Wholesale", href: "/wholesale" },
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms" },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Image
              src="/lekayoLogo.png"
              alt="Lekayo"
              width={140}
              height={40}
              className="mb-4 brightness-0 invert" // makes a dark logo render white on the dark footer bg
            />
            <p className="text-gray-400 text-sm">Luxury fashion for the discerning.</p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-gray-400 hover:text-white text-sm transition">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Lekayo. All rights reserved.
        </div>
      </div>
    </footer>
  )
}