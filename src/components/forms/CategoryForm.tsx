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
import { createCategory, updateCategory } from "@/actions/category.actions"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  banner: z.string().optional(),
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
})

type CategoryValues = z.infer<typeof categorySchema>

export default function CategoryForm({ category }: { category?: any }) {
  const router = useRouter()
  const form = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: category || { featured: false, order: 0, banner: "" },
  })

  const onSubmit = async (data: CategoryValues) => {
    try {
      if (category) {
        await updateCategory(category.id, data)
        toast({ title: "Category updated" })
      } else {
        await createCategory(data)
        toast({ title: "Category created" })
      }
      router.push("/admin/categories")
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
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <div>
          <FormLabel>Banner</FormLabel>
          <FormField control={form.control} name="banner" render={({ field }) => (
            <FormItem>
              <FormControl>
                <ImageUpload
                  value={field.value}
                  onChange={(url) => field.onChange(url)}
                  onRemove={() => field.onChange("")}
                  folder="categories"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

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

        <Button type="submit">Save Category</Button>
      </form>
    </Form>
  )
}