"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { formatPrice, getEffectivePrice, hasFlashSaleDiscount } from "@/lib/utils"
import AddToCartButton from "./AddToCartButton"
import WishlistButton from "./WishlistButton"
import VariantSelector from "./VariantSelector"
import QuantitySelector from "./QuantitySelector"

export interface AddedItemSummary {
  name: string
  image: string
  price: number
  originalPrice?: number
  quantity: number
  color?: { name: string }
  size?: string
}

interface ProductDetailViewProps {
  product: any
  onAdded?: (summary: AddedItemSummary) => void
}

export default function ProductDetailView({ product, onAdded }: ProductDetailViewProps) {
  const [selectedColorId, setSelectedColorId] = useState<string | undefined>(
    product.variants.find((v: any) => v.colorId)?.colorId || undefined,
  )
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.variants.find((v: any) => v.sizeValue)?.sizeValue || undefined,
  )
  const sortedVariants = [...(product.variants || [])].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
  const [selectedVariant, setSelectedVariant] = useState<any>(sortedVariants[0])
  const [quantity, setQuantity] = useState(1)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    const variant = sortedVariants.find((v: any) => {
      const colorMatch = selectedColorId ? v.colorId === selectedColorId : true
      const sizeMatch = selectedSize ? v.sizeValue === selectedSize : true
      return colorMatch && sizeMatch
    })
    setSelectedVariant(variant ?? sortedVariants[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColorId, selectedSize, product.variants])

  useEffect(() => {
    setActiveImageIndex(0)
    setQuantity(1)
  }, [selectedVariant])

  const resolvedFlash = (product as any)._flashSaleResolved
  const flashAdjusted = { ...product, flashSaleItems: (product as any).flashSaleItems, flashSaleItem: (product as any).flashSaleItem }
  const isOnFlashSale = resolvedFlash ? resolvedFlash.discountSaved > 0 : hasFlashSaleDiscount(flashAdjusted)
  const variantPrice = selectedVariant?.price
  const price = resolvedFlash?.finalPrice ?? variantPrice ?? getEffectivePrice(flashAdjusted)
  const originalPrice = resolvedFlash?.originalPrice ?? product.basePrice
  const showDiscount = price < originalPrice

  const sortedImages = [...(selectedVariant?.images || [])].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
  const mainImage = sortedImages[activeImageIndex]?.url || sortedImages[0]?.url || "/placeholder.png"
  const stock = selectedVariant?.stock

  const handleAdded = () =>
    onAdded?.({
      name: product.name,
      image: mainImage,
      price,
      originalPrice: showDiscount ? originalPrice : undefined,
      quantity,
      color: selectedVariant?.color ? { name: selectedVariant.color.name } : undefined,
      size: selectedVariant?.sizeValue,
    })

  const cta = (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-gray-700">Quantity</span>
        <QuantitySelector quantity={quantity} max={stock ?? 999} onQuantityChange={setQuantity} />
      </div>
      <AddToCartButton
        variantId={selectedVariant?.id}
        quantity={quantity}
        productName={product.name}
        price={price}
        originalPrice={showDiscount ? originalPrice : undefined}
        image={mainImage}
        sku={selectedVariant?.sku || product.sku}
        productId={product.id}
        stock={stock}
        color={selectedVariant?.color}
        size={selectedVariant?.sizeValue}
        onAdded={handleAdded}
      />
    </div>
  )

  return (
    <div>
      <div>
        <div className="grid gap-8 md:grid-cols-2 md:gap-10">
          <div className="space-y-4">
            <div
              className="relative aspect-square touch-pan-x overflow-hidden rounded-lg bg-gray-100"
              onTouchStart={(e) => {
                const touch = e.touches[0]
                ;(e.currentTarget as HTMLDivElement).dataset.startX = String(touch.clientX)
              }}
              onTouchEnd={(e) => {
                const startX = parseFloat((e.currentTarget as HTMLDivElement).dataset.startX || "0")
                const diff = startX - e.changedTouches[0].clientX
                if (Math.abs(diff) > 40 && sortedImages.length > 1) {
                  if (diff > 0 && activeImageIndex < sortedImages.length - 1) setActiveImageIndex(activeImageIndex + 1)
                  else if (diff < 0 && activeImageIndex > 0) setActiveImageIndex(activeImageIndex - 1)
                }
              }}
            >
              <Image
                src={mainImage}
                alt={product.name}
                fill
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.png"
                }}
              />
            </div>
            {sortedImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {sortedImages.map((img: any, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-md border-2 bg-gray-100 transition ${
                      idx === activeImageIndex ? "border-black" : "border-transparent"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt=""
                      width={80}
                      height={80}
                      sizes="80px"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.png"
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-serif md:text-3xl">{product.name}</h1>
            <p className="mt-1 text-gray-500">{product.brand?.name || "Unknown Brand"}</p>
            <div className="mt-4 flex flex-wrap items-baseline gap-2">
              <span className="text-2xl font-bold">{formatPrice(price)}</span>
              {showDiscount && (
                <>
                  <span className="text-gray-400 line-through">{formatPrice(originalPrice)}</span>
                  {isOnFlashSale && (
                    <span className="text-sm font-medium text-red-500">
                      {Math.round((1 - price / originalPrice) * 100)}% OFF
                    </span>
                  )}
                </>
              )}
            </div>
            <div className="mt-5">
              <VariantSelector
                variants={product.variants}
                selectedColorId={selectedColorId}
                selectedSize={selectedSize}
                onColorChange={setSelectedColorId}
                onSizeChange={setSelectedSize}
              />
            </div>

            <div className="mt-6">
              {cta}
              <div className="mt-3">
                <WishlistButton productId={product.id} />
              </div>
            </div>

            <div className="mt-6 space-y-2 text-sm text-gray-600">
              {product.description && (
                <>
                  <h3 className="font-semibold text-gray-900">Description</h3>
                  <p>{product.description}</p>
                </>
              )}
              {product.materials && (
                <p>
                  <strong>Materials:</strong> {product.materials}
                </p>
              )}
              <p>
                <strong>SKU:</strong> {product.sku}
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
