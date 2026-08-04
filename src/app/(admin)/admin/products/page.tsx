import { prisma } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import ProductList from "@/components/admin/ProductList"

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ include: { brand: true, category: true }, orderBy: { createdAt: "desc" } })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-serif">Products</h1>
        <Button asChild><Link href="/admin/products/new">Add Product</Link></Button>
      </div>
      <ProductList products={products} />
    </div>
  )
}