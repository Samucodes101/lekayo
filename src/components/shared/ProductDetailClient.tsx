"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { formatPrice, getEffectivePrice, hasFlashSaleDiscount } from "@/lib/utils"
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
  const sortedVariants = [...(product.variants || [])].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
  const [selectedVariant, setSelectedVariant] = useState<any>(sortedVariants[0])
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // Update selected variant when color or size changes
  useEffect(() => {
    const variant = sortedVariants.find((v: any) => {
      const colorMatch = selectedColorId ? v.colorId === selectedColorId : true
      const sizeMatch = selectedSize ? v.sizeValue === selectedSize : true
      return colorMatch && sizeMatch
    })
    if (variant) {
      setSelectedVariant(variant)
    } else {
      // If no match, fallback to first variant
      setSelectedVariant(sortedVariants[0])
    }
  }, [selectedColorId, selectedSize, product.variants])

  // Reset active image index when selected variant changes
  useEffect(() => {
    setActiveImageIndex(0)
  }, [selectedVariant])

  // Prefer server-resolved flash sale price (covers criteria-based discounts),
  // fall back to client-side resolution from FlashSaleProduct rows
  const resolvedFlash = (product as any)._flashSaleResolved
  const flashAdjustedProduct = {
    ...product,
    flashSaleItems: (product as any).flashSaleItems,
    flashSaleItem: (product as any).flashSaleItem,
  }

  const effectiveFromClient = getEffectivePrice(flashAdjustedProduct)
  const effectivePrice = resolvedFlash?.finalPrice ?? effectiveFromClient
  // Flash sale price overrides both variant price and product salePrice
  const price = effectivePrice

  const isOnFlashSale = resolvedFlash ? resolvedFlash.discountSaved > 0 : hasFlashSaleDiscount(flashAdjustedProduct)

  const variantPrice = selectedVariant?.price
  const fallbackOrig = product.salePrice ?? product.basePrice
  const originalPrice = resolvedFlash?.originalPrice ?? variantPrice ?? fallbackOrig
  const sortedImages = [...(selectedVariant?.images || [])].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
  const mainImage = sortedImages[activeImageIndex]?.url || sortedImages[0]?.url || "/placeholder.png"

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Image Gallery — touch-swipeable on mobile */}
      <div className="space-y-4">
        <div
          className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative touch-pan-x"
          onTouchStart={(e) => {
            const touch = e.touches[0]
            ;(e.currentTarget as HTMLDivElement).dataset.startX = String(touch.clientX)
          }}
          onTouchEnd={(e) => {
            const startX = parseFloat((e.currentTarget as HTMLDivElement).dataset.startX || "0")
            const endX = e.changedTouches[0].clientX
            const diff = startX - endX
            if (Math.abs(diff) > 40 && sortedImages.length > 1) {
              if (diff > 0 && activeImageIndex < sortedImages.length - 1) {
                setActiveImageIndex(activeImageIndex + 1)
              } else if (diff < 0 && activeImageIndex > 0) {
                setActiveImageIndex(activeImageIndex - 1)
              }
            }
          }}
        >
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
        <div className="flex gap-2 overflow-x-auto pb-2">
          {sortedImages.map((img: any, idx: number) => (
            <div
              key={idx}
              onClick={() => setActiveImageIndex(idx)}
              className={`w-20 h-20 bg-gray-100 rounded-md overflow-hidden cursor-pointer relative flex-shrink-0 border-2 transition min-w-[80px] ${
                idx === activeImageIndex ? "border-black" : "border-transparent"
              }`}
            >
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
          {isOnFlashSale && price < originalPrice ? (
            <>
              <span className="text-gray-400 line-through">{formatPrice(originalPrice)}</span>
              <span className="text-sm text-red-500 font-medium">{Math.round((1 - price / originalPrice) * 100)}% OFF</span>
            </>
          ) : product.salePrice && product.salePrice < product.basePrice ? (
            <span className="text-gray-400 line-through">{formatPrice(product.basePrice)}</span>
          ) : null}
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
            originalPrice={isOnFlashSale ? originalPrice : undefined}
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