"use client"

import { ProductVariant, Color } from "@prisma/client"

interface VariantSelectorProps {
  variants: ProductVariant[]
  selectedColorId?: string
  selectedSize?: string
  onColorChange: (colorId: string) => void
  onSizeChange: (size: string) => void
}

export default function VariantSelector({ variants, selectedColorId, selectedSize, onColorChange, onSizeChange }: VariantSelectorProps) {
  const colors = Array.from(
    new Map(
      variants
        .filter((v) => v.colorId)
        .map((v) => [v.colorId, v.colorId])
    ).values()
  ).filter(Boolean) as string[]
  const sizes = Array.from(new Set(variants.filter((v) => v.sizeValue).map((v) => v.sizeValue).filter(Boolean))) as string[]

  return (
    <div className="space-y-4">
      {colors.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">Color</label>
          <div className="flex gap-2">
            {colors.map((colorId) => (
              <button
                key={colorId}
                onClick={() => onColorChange(colorId)}
                className={`w-8 h-8 rounded-full border-2 ${selectedColorId === colorId ? "border-black" : "border-transparent"}`}
              />
            ))}
          </div>
        </div>
      )}
      {sizes.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">Size</label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => onSizeChange(size)}
                className={`px-3 py-1 border rounded-md text-sm ${selectedSize === size ? "bg-black text-white border-black" : "bg-white text-black border-gray-300 hover:border-black"}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}