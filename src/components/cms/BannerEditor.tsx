"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "@/hooks/use-toast"

const bannerSchema = z.object({
  image: z.string().url(),
  link: z.string().optional(),
  position: z.string(),
  active: z.boolean().default(true),
  order: z.number().int().default(0),
})

type BannerValues = z.infer<typeof bannerSchema>

export function BannerEditor({ banner, onSave, onCancel }: { banner?: any; onSave: () => void; onCancel: () => void }) {
  const form = useForm<BannerValues>({ resolver: zodResolver(bannerSchema), defaultValues: banner || { active: true, order: 0, position: "MIDDLE" } })

  const onSubmit = async (data: BannerValues) => {
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
        <FormField control={form.control} name="image" render={({ field }) => (<FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="link" render={({ field }) => (<FormItem><FormLabel>Link</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="position" render={({ field }) => (<FormItem><FormLabel>Position</FormLabel><FormControl><select {...field} className="w-full border rounded p-2"><option value="TOP">Top</option><option value="MIDDLE">Middle</option><option value="BOTTOM">Bottom</option></select></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="order" render={({ field }) => (<FormItem><FormLabel>Order</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="active" render={({ field }) => (<FormItem className="flex items-center gap-2"><FormLabel>Active</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
        <div className="flex gap-2">
          <Button type="submit">Save</Button>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </Form>
  )
}