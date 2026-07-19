"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ImageUpload } from "@/components/shared/ImageUpload"
import { createBrand, updateBrand } from "@/actions/brand.actions"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

const brandSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  logo: z.string().optional(),
  banner: z.string().optional(),
  description: z.string().optional(),
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
})

type BrandValues = z.infer<typeof brandSchema>

export default function BrandForm({ brand }: { brand?: any }) {
  const router = useRouter()
  const form = useForm<BrandValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: brand || { featured: false, order: 0 },
  })

  const onSubmit = async (data: BrandValues) => {
    try {
      if (brand) {
        await updateBrand(brand.id, data)
        toast({ title: "Brand updated" })
      } else {
        await createBrand(data)
        toast({ title: "Brand created" })
      }
      router.push("/admin/brands")
    } catch (error) {
      toast({ title: "Error", variant: "destructive" })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="slug" render={({ field }) => (
          <FormItem><FormLabel>Slug</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <div>
          <FormLabel>Logo</FormLabel>
          <ImageUpload
            value={form.watch("logo")}
            onChange={(url) => form.setValue("logo", url)}
            onRemove={() => form.setValue("logo", "")}
            folder="brands"
          />
        </div>

        <div>
          <FormLabel>Banner</FormLabel>
          <ImageUpload
            value={form.watch("banner")}
            onChange={(url) => form.setValue("banner", url)}
            onRemove={() => form.setValue("banner", "")}
            folder="brands"
          />
        </div>

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <div className="flex items-center gap-2">
          <FormField control={form.control} name="featured" render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormLabel>Featured</FormLabel>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
          )} />
        </div>

        {/* <FormField control={form.control} name="order" render={({ field }) => (
          <FormItem><FormLabel>Order</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
        )} /> */}

        <Button type="submit">Save Brand</Button>
      </form>
    </Form>
  )
}