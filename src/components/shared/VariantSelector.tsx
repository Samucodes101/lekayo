"use client"

import { ProductVariant, Color } from "@prisma/client"

interface VariantSelectorProps {
  variants: (ProductVariant & { color?: Color | null })[]
  selectedColorId?: string
  selectedSize?: string
  onColorChange: (colorId: string) => void
  onSizeChange: (size: string) => void
}

export default function VariantSelector({
  variants,
  selectedColorId,
  selectedSize,
  onColorChange,
  onSizeChange,
}: VariantSelectorProps) {
  // Extract unique colors from variants
  const colorMap = new Map<string, { id: string; name: string; hexCode: string }>()
  variants.forEach(v => {
    if (v.color) {
      colorMap.set(v.color.id, {
        id: v.color.id,
        name: v.color.name,
        hexCode: v.color.hexCode,
      })
    }
  })
  const colors = Array.from(colorMap.values())

  // Extract unique sizes from variants
  const sizeSet = new Set<string>()
  variants.forEach(v => {
    if (v.sizeValue) {
      sizeSet.add(v.sizeValue)
    }
  })
  const sizes = Array.from(sizeSet)

  // If no colors or sizes, don't render
  if (colors.length === 0 && sizes.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {colors.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">Color</label>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color.id}
                onClick={() => onColorChange(color.id)}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition ${
                  selectedColorId === color.id ? "border-black" : "border-transparent"
                }`}
                style={{ backgroundColor: color.hexCode }}
                title={color.name}
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
                className={`px-4 py-2 border rounded-md text-sm transition ${
                  selectedSize === size
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-gray-300 hover:border-black"
                }`}
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