import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Image, Megaphone, Star, FileText, Home, Users, ShoppingBag } from "lucide-react"

const cmsSections = [
  { name: "Homepage Sections", href: "/admin/cms/homepage", icon: Home, description: "Reorder and manage homepage sections" },
  { name: "Hero Banner", href: "/admin/cms/hero", icon: Image, description: "Manage the main hero banner" },
  { name: "Promotional Banners", href: "/admin/cms/banners", icon: Megaphone, description: "Manage promotional banners" },
  { name: "Seasonal Campaigns", href: "/admin/cms/campaigns", icon: Star, description: "Create and manage seasonal campaigns" },
  { name: "Style Collections", href: "/admin/cms/collections", icon: ShoppingBag, description: "Curate style collections" },
  { name: "Testimonials", href: "/admin/cms/testimonials", icon: Users, description: "Manage customer testimonials" },
  { name: "Editorial Blocks", href: "/admin/cms/editorial", icon: FileText, description: "Create editorial content blocks" },
  { name: "Gallery Images", href: "/admin/cms/gallery", icon: Image, description: "Manage the gallery images" },
  { name: "Wholesale Page", href: "/admin/cms/wholesale", icon: FileText, description: "Edit wholesale page content" },
  { name: "Footer Content", href: "/admin/cms/footer", icon: FileText, description: "Manage footer links and content" },
]

export default function CMSPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif">Content Management</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cmsSections.map((section) => (
          <Card key={section.href}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <section.icon className="h-5 w-5 text-gray-500" />
                {section.name}
              </CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="sm">
                <Link href={section.href}>Manage</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}