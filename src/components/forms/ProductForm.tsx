"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/shared/ImageUpload"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { createProduct, updateProduct } from "@/actions/product.actions"
import Image from "next/image"

const productSchema = z.object({
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
  variants: z.array(z.object({
    sku: z.string().min(3),
    stock: z.number().int().min(0),
    price: z.number().positive().nullable().optional(),
    colorId: z.string().optional(),
    sizeValue: z.string().optional(),
    images: z.array(z.object({
      url: z.string(),
      publicId: z.string(),
      altText: z.string().optional(),
    })).optional(),
  })).optional(),
})

type ProductValues = z.infer<typeof productSchema>

export default function ProductForm({ product }: { product?: any }) {
  const router = useRouter()
  const [brands, setBrands] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [colors, setColors] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Prepare default values - ensure images array exists
  const defaultValues = product
    ? {
        ...product,
        variants: product.variants?.map((v: any) => ({
          ...v,
          images: v.images || [],
        })) || [{ sku: "", stock: 0, images: [] }],
      }
    : { status: "DRAFT", featured: false, variants: [{ sku: "", stock: 0, images: [] }] }

  const form = useForm<ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "variants" })

  useEffect(() => {
    Promise.all([
      fetch("/api/brands").then(res => res.json()),
      fetch("/api/categories").then(res => res.json()),
      fetch("/api/colors").then(res => res.json()),
    ]).then(([brandsData, categoriesData, colorsData]) => {
      setBrands(brandsData)
      setCategories(categoriesData)
      setColors(colorsData)
    })
  }, [])

  const onSubmit = async (data: ProductValues) => {
    setLoading(true)
    try {
      const cleanedData = {
        ...data,
        salePrice: data.salePrice || undefined, // ✅ ensure undefined, not null
        variants: data.variants?.map(v => ({
          ...v,
          price: v.price || undefined,
          images: v.images?.map(img => ({
            url: img.url,
            publicId: img.publicId,
            altText: img.altText || "",
          })) || [],
        })) || [],
      }
      if (product) {
        await updateProduct(product.id, cleanedData)
        toast({ title: "Product updated" })
      } else {
        await createProduct(cleanedData)
        toast({ title: "Product created" })
      }
      router.push("/admin/products")
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Something went wrong", variant: "destructive" })
    }
    setLoading(false)
  }

  const watchVariants = form.watch("variants")

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="sku" render={({ field }) => (
            <FormItem><FormLabel>SKU</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        {/* Pricing - salePrice must send undefined */}
        <div className="grid md:grid-cols-2 gap-4">
          <FormField control={form.control} name="basePrice" render={({ field }) => (
            <FormItem><FormLabel>Base Price *</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="salePrice" render={({ field }) => (
            <FormItem><FormLabel>Sale Price (optional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  value={field.value ?? ""}
                  onChange={e => {
                    const val = e.target.value
                    field.onChange(val === "" ? undefined : Number(val))
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Brand & Category */}
        <div className="grid md:grid-cols-2 gap-4">
          <FormField control={form.control} name="brandId" render={({ field }) => (
            <FormItem><FormLabel>Brand</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger></FormControl>
                <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="categoryId" render={({ field }) => (
            <FormItem><FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Subcategory */}
        <FormField control={form.control} name="subcategoryId" render={({ field }) => (
          <FormItem><FormLabel>Subcategory (optional)</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select subcategory" /></SelectTrigger></FormControl>
              <SelectContent>
                {categories.find(c => c.id === form.watch("categoryId"))?.subcategories?.map((s: any) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        {/* Status & Featured */}
        <div className="grid md:grid-cols-2 gap-4">
          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem><FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="featured" render={({ field }) => (
            <FormItem className="flex items-center gap-2 pt-6">
              <FormLabel>Featured</FormLabel>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
          )} />
        </div>

        {/* Tags & Materials */}
        <div className="grid md:grid-cols-2 gap-4">
          <FormField control={form.control} name="tags" render={({ field }) => (
            <FormItem><FormLabel>Tags (comma separated)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value?.join(", ") || ""} onChange={e => field.onChange(e.target.value.split(",").map(s => s.trim()).filter(Boolean))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="materials" render={({ field }) => (
            <FormItem><FormLabel>Materials</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        {/* Variants */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Variants</h3>
          {fields.map((field, idx) => {
            const variant = watchVariants?.[idx]
            const stock = variant?.stock || 0
            const isLowStock = stock > 0 && stock <= 5
            const isOutOfStock = stock === 0

            return (
              <div key={field.id} className="border rounded-lg p-4 mb-4 space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">Variant #{idx + 1}</h4>
                  <Button type="button" variant="destructive" size="sm" onClick={() => remove(idx)}>
                    Remove
                  </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <FormField control={form.control} name={`variants.${idx}.sku`} render={({ field }) => (
                    <FormItem><FormLabel>SKU *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name={`variants.${idx}.stock`} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                          {isOutOfStock && (
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-red-500 font-medium">Out of stock</span>
                          )}
                          {isLowStock && (
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-amber-500 font-medium">Only {stock} left</span>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name={`variants.${idx}.price`} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (optional override)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value
                            field.onChange(val === "" ? undefined : Number(val))
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField control={form.control} name={`variants.${idx}.colorId`} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color (optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select color">
                              {field.value && colors.find(c => c.id === field.value)?.name}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {colors.map(c => (
                            <SelectItem key={c.id} value={c.id}>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: c.hexCode }} />
                                {c.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name={`variants.${idx}.sizeValue`} render={({ field }) => (
                    <FormItem><FormLabel>Size (optional)</FormLabel><FormControl><Input {...field} placeholder="e.g., M, 42, 38mm" /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>

                {/* Variant Images - this now properly displays existing images */}
                <div>
                  <Label>Variant Images</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                    {variant?.images?.map((img: any, imgIdx: number) => (
                      <div key={imgIdx} className="relative aspect-square">
                        <Image
                          src={img.url}
                          alt={img.altText || ""}
                          width={120}
                          height={120}
                          className="w-full h-full object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.png"
                          }}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => {
                            const newImages = variant.images?.filter((_: any, i: number) => i !== imgIdx) || []
                            form.setValue(`variants.${idx}.images`, newImages)
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                    <div className="aspect-square border-2 border-dashed rounded flex items-center justify-center">
                      <ImageUpload
                        folder={`products/${form.getValues("sku") || "product"}`}
                        onChange={(url, publicId) => {
                          const current = form.getValues(`variants.${idx}.images`) || []
                          form.setValue(`variants.${idx}.images`, [...current, { url, publicId }])
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          <Button type="button" variant="outline" onClick={() => append({ sku: "", stock: 0, images: [] })}>
            + Add Variant
          </Button>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Product"}</Button>
          <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}