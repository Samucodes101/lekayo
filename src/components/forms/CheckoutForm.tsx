"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useCartStore } from "@/stores/cartStore"
import { loadPaystackScript, initializePayment } from "@/lib/paystack"
import { toast } from "@/hooks/use-toast"

const checkoutSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(3),
  phone: z.string().min(10),
})

type CheckoutValues = z.infer<typeof checkoutSchema>

export default function CheckoutForm() {
  const [loading, setLoading] = useState(false)
  const { items, getTotal } = useCartStore()
  const form = useForm<CheckoutValues>({ resolver: zodResolver(checkoutSchema) })

  const onSubmit = async (data: CheckoutValues) => {
    setLoading(true)
    try {
      const res = await fetch("/api/checkout/init", {
        method: "POST",
        body: JSON.stringify({ ...data, items, total: getTotal() }),
        headers: { "Content-Type": "application/json" },
      })
      const { authorizationUrl, reference } = await res.json()
      // Redirect to Paystack
      window.location.href = authorizationUrl
    } catch (error) {
      toast({ title: "Checkout failed", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <div className="grid md:grid-cols-2 gap-4">
          <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <div className="grid md:grid-cols-3 gap-4">
          <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="state" render={({ field }) => (<FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="postalCode" render={({ field }) => (<FormItem><FormLabel>Postal Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <Button type="submit" disabled={loading} className="w-full">Place Order & Pay</Button>
      </form>
    </Form>
  )
}