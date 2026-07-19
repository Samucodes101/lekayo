"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ImageUpload } from "@/components/shared/ImageUpload"
import { toast } from "@/hooks/use-toast"

const bannerSchema = z.object({
  image: z.string().optional(),
  link: z.string().optional(),
  position: z.string(),
  active: z.boolean().default(true),
  order: z.number().int().default(0),
})

export default function BannerEditor({ banner, onSave }: { banner?: any; onSave: () => void }) {
  const form = useForm({
    resolver: zodResolver(bannerSchema),
    defaultValues: banner || { active: true, order: 0, position: "MIDDLE" },
  })

  const onSubmit = async (data: any) => {
    const res = await fetch("/api/cms/banners", {
      method: banner ? "PUT" : "POST",
      body: JSON.stringify(banner ? { ...data, id: banner.id } : data),
      headers: { "Content-Type": "application/json" },
    })
    if (res.ok) {
      toast({ title: "Banner saved" })
      onSave()
    } else {
      toast({ title: "Error", variant: "destructive" })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <FormLabel>Banner Image</FormLabel>
          <ImageUpload
            value={form.watch("image")}
            onChange={(url) => form.setValue("image", url)}
            onRemove={() => form.setValue("image", "")}
            folder="banners"
          />
        </div>

        <FormField control={form.control} name="link" render={({ field }) => (
          <FormItem><FormLabel>Link URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <FormField control={form.control} name="position" render={({ field }) => (
          <FormItem><FormLabel>Position</FormLabel>
            <FormControl>
              <select {...field} className="w-full border rounded p-2">
                <option value="TOP">Top</option>
                <option value="MIDDLE">Middle</option>
                <option value="BOTTOM">Bottom</option>
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="order" render={({ field }) => (
          <FormItem><FormLabel>Order</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <div className="flex items-center gap-2">
          <FormField control={form.control} name="active" render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormLabel>Active</FormLabel>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
          )} />
        </div>

        <Button type="submit">Save Banner</Button>
      </form>
    </Form>
  )
}