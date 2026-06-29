import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import Image from "next/image"
import { formatPrice } from "@/lib/utils"
import AddToCartButton from "@/components/shared/AddToCartButton"
import WishlistButton from "@/components/shared/WishlistButton"
import VariantSelector from "@/components/shared/VariantSelector"
import Breadcrumb from "@/components/shared/Breadcrumb"
import ProductGrid from "@/components/shared/ProductGrid"

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug, status: "PUBLISHED" },
    include: {
      brand: true,
      category: true,
      variants: { include: { images: true, color: true } },
    },
  })
  if (!product) notFound()

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, status: "PUBLISHED" },
    take: 4,
    include: { variants: { include: { images: true } }, brand: true },
  })

  const price = product.salePrice ?? product.basePrice

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={[{ name: product.category.name, href: `/shop/${product.category.slug}` }, { name: product.name, href: `/products/${product.slug}` }]} />
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <Image src={product.variants[0]?.images[0]?.url || "/placeholder.png"} alt={product.name} width={800} height={800} className="object-cover" />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {product.variants.flatMap(v => v.images).map((img, idx) => (
              <div key={idx} className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden cursor-pointer">
                <Image src={img.url} alt="" width={80} height={80} className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-serif">{product.name}</h1>
          <p className="text-gray-500 mt-1">{product.brand.name}</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold">{formatPrice(price)}</span>
            {product.salePrice && <span className="text-gray-400 line-through">{formatPrice(product.basePrice)}</span>}
          </div>
          <div className="mt-4">
            <VariantSelector variants={product.variants} onColorChange={() => {}} onSizeChange={() => {}} />
          </div>
          <div className="mt-6 space-y-3">
            <AddToCartButton variantId={product.variants[0].id} quantity={1} />
            <WishlistButton productId={product.id} />
          </div>
          <div className="mt-8 prose prose-sm max-w-none">
            <h3 className="font-semibold">Description</h3>
            <p>{product.description}</p>
            {product.materials && <p><strong>Materials:</strong> {product.materials}</p>}
            <p><strong>SKU:</strong> {product.sku}</p>
          </div>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-serif mb-6">You May Also Like</h2>
        <ProductGrid products={related as any} />
      </section>
    </div>
  )
}