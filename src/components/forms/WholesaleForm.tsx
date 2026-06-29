"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "@/hooks/use-toast"

const wholesaleSchema = z.object({
  businessName: z.string().min(2),
  contactName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  taxId: z.string().optional(),
  message: z.string().optional(),
})

type WholesaleValues = z.infer<typeof wholesaleSchema>

export default function WholesaleForm() {
  const [loading, setLoading] = useState(false)
  const form = useForm<WholesaleValues>({ resolver: zodResolver(wholesaleSchema) })

  const onSubmit = async (data: WholesaleValues) => {
    setLoading(true)
    const res = await fetch("/api/wholesale/apply", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } })
    if (res.ok) {
      toast({ title: "Application submitted", description: "We will contact you soon." })
      form.reset()
    } else {
      toast({ title: "Error", description: "Please try again later.", variant: "destructive" })
    }
    setLoading(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="businessName" render={({ field }) => (<FormItem><FormLabel>Business Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="contactName" render={({ field }) => (<FormItem><FormLabel>Contact Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="taxId" render={({ field }) => (<FormItem><FormLabel>Tax ID (optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="message" render={({ field }) => (<FormItem><FormLabel>Additional Info</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
        <Button type="submit" disabled={loading}>Submit Application</Button>
      </form>
    </Form>
  )
}