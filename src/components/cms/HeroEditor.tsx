"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { updateHeroBanner } from "@/actions/cms.actions"
import { toast } from "@/hooks/use-toast"

const heroSchema = z.object({
  headline: z.string().min(2),
  subheadline: z.string().optional(),
  ctaText: z.string().min(2),
  ctaLink: z.string().min(2),
  image: z.string().url(),
  active: z.boolean().default(true),
  order: z.number().int().default(0),
})

export default function HeroEditor({ hero }: { hero?: any }) {
  const form = useForm({ resolver: zodResolver(heroSchema), defaultValues: hero || { active: true, order: 0 } })

  const onSubmit = async (data: any) => {
    try {
      if (hero) {
        await updateHeroBanner(hero.id, data)
        toast({ title: "Hero updated" })
      }
    } catch (error) {
      toast({ title: "Error", variant: "destructive" })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="headline" render={({ field }) => (<FormItem><FormLabel>Headline</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="subheadline" render={({ field }) => (<FormItem><FormLabel>Subheadline</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="ctaText" render={({ field }) => (<FormItem><FormLabel>CTA Text</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="ctaLink" render={({ field }) => (<FormItem><FormLabel>CTA Link</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="image" render={({ field }) => (<FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <div className="flex items-center gap-2">
          <FormField control={form.control} name="active" render={({ field }) => (<FormItem className="flex items-center gap-2"><FormLabel>Active</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
        </div>
        <FormField control={form.control} name="order" render={({ field }) => (<FormItem><FormLabel>Order</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <Button type="submit">Save Hero</Button>
      </form>
    </Form>
  )
}