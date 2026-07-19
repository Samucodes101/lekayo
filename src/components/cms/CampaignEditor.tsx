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

const campaignSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  banner: z.string().optional(),
  description: z.string().optional(),
  startsAt: z.string(),
  endsAt: z.string(),
  active: z.boolean().default(true),
})

export default function CampaignEditor({ campaign, onSave }: { campaign?: any; onSave: () => void }) {
  const form = useForm({
    resolver: zodResolver(campaignSchema),
    defaultValues: campaign || { active: true },
  })

  const onSubmit = async (data: any) => {
    const res = await fetch("/api/cms/campaigns", {
      method: campaign ? "PUT" : "POST",
      body: JSON.stringify(campaign ? { ...data, id: campaign.id } : data),
      headers: { "Content-Type": "application/json" },
    })
    if (res.ok) {
      toast({ title: "Campaign saved" })
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

        <div>
          <FormLabel>Banner Image</FormLabel>
          <ImageUpload
            value={form.watch("banner")}
            onChange={(url) => form.setValue("banner", url)}
            onRemove={() => form.setValue("banner", "")}
            folder="campaigns"
          />
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

        <div className="flex items-center gap-2">
          <FormField control={form.control} name="active" render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormLabel>Active</FormLabel>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
          )} />
        </div>

        <Button type="submit">Save Campaign</Button>
      </form>
    </Form>
  )
}