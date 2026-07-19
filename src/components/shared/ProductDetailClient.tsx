"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { formatPrice } from "@/lib/utils"
import AddToCartButton from "./AddToCartButton"
import WishlistButton from "./WishlistButton"
import VariantSelector from "./VariantSelector"
import ProductGrid from "./ProductGrid"

interface ProductDetailClientProps {
  product: any
  related: any[]
}

export default function ProductDetailClient({ product, related }: ProductDetailClientProps) {
  const [selectedColorId, setSelectedColorId] = useState<string | undefined>(
    product.variants.find((v: any) => v.colorId)?.colorId || undefined
  )
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.variants.find((v: any) => v.sizeValue)?.sizeValue || undefined
  )
  const [selectedVariant, setSelectedVariant] = useState<any>(product.variants[0])

  // Update selected variant when color or size changes
  useEffect(() => {
    const variant = product.variants.find((v: any) => {
      const colorMatch = selectedColorId ? v.colorId === selectedColorId : true
      const sizeMatch = selectedSize ? v.sizeValue === selectedSize : true
      return colorMatch && sizeMatch
    })
    if (variant) {
      setSelectedVariant(variant)
    } else {
      // If no match, fallback to first variant
      setSelectedVariant(product.variants[0])
    }
  }, [selectedColorId, selectedSize, product.variants])

  const price = selectedVariant?.price ?? product.salePrice ?? product.basePrice
  const images = selectedVariant?.images || []
  const mainImage = images[0]?.url || "/placeholder.png"

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Image Gallery */}
      <div className="space-y-4">
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.png"
            }}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img: any, idx: number) => (
            <div key={idx} className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden cursor-pointer relative flex-shrink-0">
              <Image
                src={img.url}
                alt=""
                fill
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.png"
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Product Info */}
      <div>
        <h1 className="text-3xl font-serif">{product.name}</h1>
        <p className="text-gray-500 mt-1">{product.brand?.name || "Unknown Brand"}</p>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-2xl font-bold">{formatPrice(price)}</span>
          {product.salePrice && <span className="text-gray-400 line-through">{formatPrice(product.basePrice)}</span>}
        </div>
        <div className="mt-4">
          <VariantSelector
            variants={product.variants}
            selectedColorId={selectedColorId}
            selectedSize={selectedSize}
            onColorChange={setSelectedColorId}
            onSizeChange={setSelectedSize}
          />
        </div>
        <div className="mt-6 space-y-3">
          <AddToCartButton
            variantId={selectedVariant?.id}
            quantity={1}
            productName={product.name}
            price={price}
            image={mainImage}
            sku={selectedVariant?.sku || product.sku}
            productId={product.id}
            color={selectedVariant?.color}
            size={selectedVariant?.sizeValue}
          />
          <WishlistButton productId={product.id} />
        </div>
        <div className="mt-8 prose prose-sm max-w-none">
          <h3 className="font-semibold">Description</h3>
          <p>{product.description}</p>
          {product.materials && <p><strong>Materials:</strong> {product.materials}</p>}
          <p><strong>SKU:</strong> {product.sku}</p>
        </div>
      </div>

      {/* Related Products */}
      <div className="md:col-span-2 mt-16">
        <h2 className="text-2xl font-serif mb-6">You May Also Like</h2>
        <ProductGrid products={related} />
      </div>
    </div>
  )
}