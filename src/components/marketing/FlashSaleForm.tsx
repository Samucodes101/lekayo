"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

const discountSchema = z.object({
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().positive(),
})

const flashSaleSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  startsAt: z.string(),
  endsAt: z.string(),
  active: z.boolean().default(true),
  allProductsDiscount: discountSchema.optional(),
  products: z.array(discountSchema.extend({ productId: z.string().cuid() })).optional(),
  categoryDiscounts: z.array(discountSchema.extend({ categoryId: z.string().cuid() })).optional(),
  subcategoryDiscounts: z.array(discountSchema.extend({ subcategoryId: z.string().cuid() })).optional(),
  brandDiscounts: z.array(discountSchema.extend({ brandId: z.string().cuid() })).optional(),
})

type FlashSaleValues = z.infer<typeof flashSaleSchema>

export default function FlashSaleForm({ sale, onSave }: { sale?: any; onSave?: () => void }) {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const form = useForm<FlashSaleValues>({
    resolver: zodResolver(flashSaleSchema),
    defaultValues: sale
      ? {
          ...sale,
          ...(sale.criteria ?? {}),
          products: sale.criteria?.products ?? sale.products ?? [],
          categoryDiscounts: sale.criteria?.categoryDiscounts ?? [],
          subcategoryDiscounts: sale.criteria?.subcategoryDiscounts ?? [],
          brandDiscounts: sale.criteria?.brandDiscounts ?? [],
        }
      : {
          active: true,
          products: [],
          categoryDiscounts: [],
          subcategoryDiscounts: [],
          brandDiscounts: [],
        },
  })

  const { fields: productFields, append: appendProduct, remove: removeProduct } = useFieldArray({
    control: form.control,
    name: "products",
  })

  const { fields: categoryFields, append: appendCategory, remove: removeCategory } = useFieldArray({
    control: form.control,
    name: "categoryDiscounts",
  })

  const { fields: subcategoryFields, append: appendSubcategory, remove: removeSubcategory } = useFieldArray({
    control: form.control,
    name: "subcategoryDiscounts",
  })

  const { fields: brandFields, append: appendBrand, remove: removeBrand } = useFieldArray({
    control: form.control,
    name: "brandDiscounts",
  })

  const allProductsDiscount = form.watch("allProductsDiscount")

  useEffect(() => {
    Promise.all([
      fetch("/api/products?limit=1000").then((res) => res.json()),
      fetch("/api/categories").then((res) => res.json()),
      fetch("/api/brands").then((res) => res.json()),
    ]).then(([productsData, categoriesData, brandsData]) => {
      setProducts(productsData)
      setCategories(categoriesData)
      setBrands(brandsData)
    })
  }, [])

  const onSubmit = async (data: FlashSaleValues) => {
    setLoading(true)
    try {
      const res = await fetch("/api/marketing/flash-sales", {
        method: sale ? "PUT" : "POST",
        body: JSON.stringify(sale ? { ...data, id: sale.id } : data),
        headers: { "Content-Type": "application/json" },
      })
      if (res.ok) {
        toast({ title: sale ? "Flash sale updated" : "Flash sale created" })
        if (onSave) onSave()
        else router.push("/admin/marketing/flash-sales")
      } else {
        toast({ title: "Error", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", variant: "destructive" })
    }
    setLoading(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="slug" render={({ field }) => (
            <FormItem><FormLabel>Slug</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid md:grid-cols-2 gap-4">
          <FormField control={form.control} name="startsAt" render={({ field }) => (
            <FormItem><FormLabel>Starts At</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="endsAt" render={({ field }) => (
            <FormItem><FormLabel>Ends At</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="active" render={({ field }) => (
          <FormItem className="flex items-center gap-2"><FormLabel>Active</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
        )} />

        {/* Global discount for all products */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Apply to All Products</h3>
              <p className="text-sm text-muted-foreground">Use this to quickly give every product in the store the same discount.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (allProductsDiscount) {
                  form.setValue("allProductsDiscount", undefined)
                } else {
                  form.setValue("allProductsDiscount", { discountType: "PERCENTAGE", discountValue: 0 })
                }
              }}
            >
              {allProductsDiscount ? "Remove" : "Add"}
            </Button>
          </div>
          {allProductsDiscount ? (
            <div className="grid grid-cols-3 gap-2">
              <FormField control={form.control} name="allProductsDiscount.discountType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">%</SelectItem>
                        <SelectItem value="FIXED">$</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="allProductsDiscount.discountValue" render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="Value" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          ) : null}
        </div>

        {/* Product-specific discounts */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Product Discounts</h3>
          {productFields.map((field, idx) => (
            <div key={field.id} className="border p-4 rounded mb-2 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Product #{idx + 1}</span>
                <Button type="button" variant="destructive" size="sm" onClick={() => removeProduct(idx)}>Remove</Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <FormField control={form.control} name={`products.${idx}.productId`} render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name={`products.${idx}.discountType`} render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="PERCENTAGE">%</SelectItem><SelectItem value="FIXED">$</SelectItem></SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name={`products.${idx}.discountValue`} render={({ field }) => (
                  <FormItem><FormControl><Input type="number" step="0.01" placeholder="Value" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => appendProduct({ productId: "", discountType: "PERCENTAGE", discountValue: 0 })}>
            + Add Product Discount
          </Button>
        </div>

        {/* Category-level discounts */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Category Discounts</h3>
          {categoryFields.map((field, idx) => (
            <div key={field.id} className="border p-4 rounded mb-2 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Category #{idx + 1}</span>
                <Button type="button" variant="destructive" size="sm" onClick={() => removeCategory(idx)}>Remove</Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <FormField control={form.control} name={`categoryDiscounts.${idx}.categoryId`} render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name={`categoryDiscounts.${idx}.discountType`} render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="PERCENTAGE">%</SelectItem><SelectItem value="FIXED">$</SelectItem></SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name={`categoryDiscounts.${idx}.discountValue`} render={({ field }) => (
                  <FormItem><FormControl><Input type="number" step="0.01" placeholder="Value" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => appendCategory({ categoryId: "", discountType: "PERCENTAGE", discountValue: 0 })}>
            + Add Category Discount
          </Button>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Subcategory Discounts</h3>
          {subcategoryFields.map((field, idx) => (
            <div key={field.id} className="border p-4 rounded mb-2 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Subcategory #{idx + 1}</span>
                <Button type="button" variant="destructive" size="sm" onClick={() => removeSubcategory(idx)}>Remove</Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <FormField control={form.control} name={`subcategoryDiscounts.${idx}.subcategoryId`} render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select subcategory" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {categories.flatMap((category) =>
                          category.subcategories?.map((sub: any) => (
                            <SelectItem key={sub.id} value={sub.id}>{`${category.name} / ${sub.name}`}</SelectItem>
                          )) || []
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name={`subcategoryDiscounts.${idx}.discountType`} render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="PERCENTAGE">%</SelectItem><SelectItem value="FIXED">$</SelectItem></SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name={`subcategoryDiscounts.${idx}.discountValue`} render={({ field }) => (
                  <FormItem><FormControl><Input type="number" step="0.01" placeholder="Value" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => appendSubcategory({ subcategoryId: "", discountType: "PERCENTAGE", discountValue: 0 })}>
            + Add Subcategory Discount
          </Button>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Brand Discounts</h3>
          {brandFields.map((field, idx) => (
            <div key={field.id} className="border p-4 rounded mb-2 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Brand #{idx + 1}</span>
                <Button type="button" variant="destructive" size="sm" onClick={() => removeBrand(idx)}>Remove</Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <FormField control={form.control} name={`brandDiscounts.${idx}.brandId`} render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name={`brandDiscounts.${idx}.discountType`} render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="PERCENTAGE">%</SelectItem><SelectItem value="FIXED">$</SelectItem></SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name={`brandDiscounts.${idx}.discountValue`} render={({ field }) => (
                  <FormItem><FormControl><Input type="number" step="0.01" placeholder="Value" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => appendBrand({ brandId: "", discountType: "PERCENTAGE", discountValue: 0 })}>
            + Add Brand Discount
          </Button>
        </div>

        <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Flash Sale"}</Button>
      </form>
    </Form>
  )
}