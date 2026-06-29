import { z } from "zod"

export const orderStatusSchema = z.enum(["PENDING", "PAID", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED", "RETURNED", "CANCELLED"])

export const orderSchema = z.object({
  orderNumber: z.string().min(3),
  status: orderStatusSchema,
  subtotal: z.number().positive(),
  discount: z.number().min(0),
  shippingCost: z.number().min(0),
  tax: z.number().min(0),
  total: z.number().positive(),
  couponCode: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentReference: z.string().optional(),
})