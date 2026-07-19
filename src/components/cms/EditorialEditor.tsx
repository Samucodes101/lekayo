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
import { toast } from "@/hooks/use-toast"

const editorialSchema = z.object({
  title: z.string().min(2),
  body: z.string().min(10),
  image: z.string().optional(),
  link: z.string().optional(),
  position: z.string(),
  active: z.boolean().default(true),
  order: z.number().int().default(0),
})

export default function EditorialEditor({ block, onSave }: { block?: any; onSave: () => void }) {
  const form = useForm({
    resolver: zodResolver(editorialSchema),
    defaultValues: block || { active: true, order: 0, position: "FULL_WIDTH" },
  })

  const onSubmit = async (data: any) => {
    const res = await fetch("/api/cms/editorial", {
      method: block ? "PUT" : "POST",
      body: JSON.stringify(block ? { ...data, id: block.id } : data),
      headers: { "Content-Type": "application/json" },
    })
    if (res.ok) {
      toast({ title: "Editorial block saved" })
      onSave()
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="body" render={({ field }) => (
          <FormItem><FormLabel>Body</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div>
          <FormLabel>Image</FormLabel>
          <ImageUpload
            value={form.watch("image")}
            onChange={(url) => form.setValue("image", url)}
            onRemove={() => form.setValue("image", "")}
            folder="editorial"
          />
        </div>
        <FormField control={form.control} name="link" render={({ field }) => (
          <FormItem><FormLabel>Link URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="position" render={({ field }) => (
          <FormItem><FormLabel>Position</FormLabel>
            <FormControl>
              <select {...field} className="w-full border rounded p-2">
                <option value="LEFT">Left</option>
                <option value="RIGHT">Right</option>
                <option value="FULL_WIDTH">Full Width</option>
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
        <Button type="submit">Save Editorial Block</Button>
      </form>
    </Form>
  )
}