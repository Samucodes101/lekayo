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

const collectionSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  active: z.boolean().default(true),
})

export default function CollectionEditor({ collection, onSave }: { collection?: any; onSave: () => void }) {
  const form = useForm({
    resolver: zodResolver(collectionSchema),
    defaultValues: collection || { active: true },
  })

  const onSubmit = async (data: any) => {
    const res = await fetch("/api/cms/collections", {
      method: collection ? "PUT" : "POST",
      body: JSON.stringify(collection ? { ...data, id: collection.id } : data),
      headers: { "Content-Type": "application/json" },
    })
    if (res.ok) {
      toast({ title: "Collection saved" })
      onSave()
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
        <div className="flex items-center gap-2">
          <FormField control={form.control} name="active" render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormLabel>Active</FormLabel>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
          )} />
        </div>
        <Button type="submit">Save Collection</Button>
      </form>
    </Form>
  )
}