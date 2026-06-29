import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(3),
  description: z.string().min(10),
  basePrice: z.number().positive(),
  salePrice: z.number().positive().optional(),
  featured: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  brandId: z.string().cuid(),
  categoryId: z.string().cuid(),
  subcategoryId: z.string().cuid().optional(),
  tags: z.array(z.string()).optional(),
  materials: z.string().optional(),
  variants: z.array(z.object({ sku: z.string(), stock: z.number().int().min(0), price: z.number().optional(), colorId: z.string().optional(), sizeValue: z.string().optional() })).optional(),
})