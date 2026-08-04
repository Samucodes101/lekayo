import { prisma } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import BrandList from "@/components/admin/BrandList"

export default async function AdminBrandsPage() {
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-serif">Brands</h1>
        <Button asChild><Link href="/admin/brands/new">Add Brand</Link></Button>
      </div>
      <BrandList brands={brands} />
    </div>
  )
}