import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface BreadcrumbItem {
  name: string
  href: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center text-sm text-gray-500 mb-6">
      <Link href="/" className="hover:text-black">Home</Link>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-2" />
          {idx === items.length - 1 ? (
            <span className="text-black font-medium">{item.name}</span>
          ) : (
            <Link href={item.href} className="hover:text-black">{item.name}</Link>
          )}
        </div>
      ))}
    </nav>
  )
}