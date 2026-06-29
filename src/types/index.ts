export interface ProductWithVariants {
  id: string
  name: string
  slug: string
  sku: string
  description: string
  basePrice: number
  salePrice?: number
  featured: boolean
  status: string
  brand: { id: string; name: string; slug: string }
  category: { id: string; name: string; slug: string }
  variants: Array<{
    id: string
    sku: string
    price?: number
    stock: number
    color?: { name: string; hexCode: string }
    sizeValue?: string
    images: Array<{ url: string; altText?: string }>
  }>
}