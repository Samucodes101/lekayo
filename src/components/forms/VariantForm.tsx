"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { createVariant, updateVariant } from "@/actions/variant.actions"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const variantSchema = z.object({
  sku: z.string().min(3),
  price: z.number().optional(),
  stock: z.number().int().min(0),
  colorId: z.string().optional(),
  sizeValue: z.string().optional(),
  images: z.array(z.object({ url: z.string(), altText: z.string().optional() })).optional(),
})

type VariantValues = z.infer<typeof variantSchema>

export default function VariantForm({ variant, productId }: { variant?: any; productId: string }) {
  const router = useRouter()
  const [colors, setColors] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    fetch("/api/colors").then(res => res.json()).then(setColors)
  }, [])

  const form = useForm<VariantValues>({
    resolver: zodResolver(variantSchema),
    defaultValues: variant || { stock: 0, images: [] },
  })
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "images",
  })

  const onSubmit = async (data: VariantValues) => {
    try {
      if (variant) {
        await updateVariant(variant.id, data)
        toast({ title: "Variant updated" })
      } else {
        await createVariant({ ...data, productId })
        toast({ title: "Variant created" })
      }
      router.push(`/admin/products/${productId}`)
    } catch (error) {
      toast({ title: "Error", variant: "destructive" })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (override)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="colorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {colors.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sizeValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Size</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <h3 className="font-semibold mb-2">Images</h3>
          {fields.map((field, idx) => (
            <div key={field.id} className="border p-4 rounded mb-2 space-y-2">
              <Input placeholder="Image URL" {...form.register(`images.${idx}.url`)} />
              <Input placeholder="Alt text" {...form.register(`images.${idx}.altText`)} />
              <Button type="button" variant="destructive" onClick={() => remove(idx)}>
                Remove
              </Button>
            </div>
          ))}
          <Button type="button" onClick={() => append({ url: "", altText: "" })}>
            Add Image
          </Button>
        </div>
        <Button type="submit">Save Variant</Button>
      </form>
    </Form>
  )
}