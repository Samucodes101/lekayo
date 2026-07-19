export interface ProductWithVariants {
  id: string
  name: string
  slug: string
  sku: string
  description: string
  basePrice: number
  salePrice?: number | null
  featured: boolean
  status: string
  brand: {
    id: string
    name: string
    slug: string
  }
  category: {
    id: string
    name: string
    slug: string
  }
  variants: Array<{
    id: string
    sku: string
    price?: number | null
    stock: number
    color?: {
      name: string
      hexCode: string
    } | null
    sizeValue?: string | null
    images: Array<{
      url: string
      altText?: string | null
    }>
  }>
}