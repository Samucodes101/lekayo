"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ImageUpload } from "@/components/shared/ImageUpload"
import { toast } from "@/hooks/use-toast"

const gallerySchema = z.object({
  image: z.string().optional(),
  link: z.string().optional(),
  altText: z.string().optional(),
  order: z.number().int().default(0),
})

export default function GalleryImageEditor({ image, onSave }: { image?: any; onSave: () => void }) {
  const form = useForm({
    resolver: zodResolver(gallerySchema),
    defaultValues: image || { order: 0 },
  })

  const onSubmit = async (data: any) => {
    const res = await fetch("/api/cms/gallery", {
      method: image ? "PUT" : "POST",
      body: JSON.stringify(image ? { ...data, id: image.id } : data),
      headers: { "Content-Type": "application/json" },
    })
    if (res.ok) {
      toast({ title: "Gallery image saved" })
      onSave()
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <FormLabel>Image</FormLabel>
          <ImageUpload
            value={form.watch("image")}
            onChange={(url) => form.setValue("image", url)}
            onRemove={() => form.setValue("image", "")}
            folder="gallery"
          />
        </div>
        <FormField control={form.control} name="link" render={({ field }) => (
          <FormItem><FormLabel>Link URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="altText" render={({ field }) => (
          <FormItem><FormLabel>Alt Text</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="order" render={({ field }) => (
          <FormItem><FormLabel>Order</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <Button type="submit">Save Image</Button>
      </form>
    </Form>
  )
}