"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useActiveCart } from "@/hooks/useActiveCart";
import { toast } from "@/hooks/use-toast";
import {
  type DeliveryLocation,
  detectDeliveryLocation,
  getDeliveryCostForLocation,
} from "@/lib/deliveryLocations";

const checkoutSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  postalCode: z.string().optional().or(z.literal("")),
  phone: z.string().min(10),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

type CheckoutFormProps = {
  deliveryLocations: DeliveryLocation[];
  deliveryTimeframe: string;
  onShippingChange?: (shippingCost: number) => void;
};

export default function CheckoutForm({
  deliveryLocations,
  deliveryTimeframe,
  onShippingChange,
}: CheckoutFormProps) {
  const [loading, setLoading] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const { items } = useActiveCart();
  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      phone: "",
    },
  });

  const address = form.watch("address");
  const city = form.watch("city");
  const state = form.watch("state");

  const fullAddress = `${address ?? ""} ${city ?? ""} ${state ?? ""}`;

  const detectedLocation = useMemo(
    () =>
      deliveryMethod === "delivery"
        ? detectDeliveryLocation(fullAddress, deliveryLocations)
        : null,
    [fullAddress, deliveryLocations, deliveryMethod],
  );

  const shippingCost = useMemo(() => {
    if (deliveryMethod === "pickup") return 0;
    if (!detectedLocation) return 0;
    return getDeliveryCostForLocation(detectedLocation.id, deliveryLocations) ?? 0;
  }, [deliveryMethod, detectedLocation, deliveryLocations]);

  // Notify parent whenever shipping cost changes
  useEffect(() => {
    onShippingChange?.(shippingCost);
  }, [shippingCost, onShippingChange]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + shippingCost;

  const handleDeliveryMethodChange = (value: "delivery" | "pickup") => {
    setDeliveryMethod(value);
    if (value === "pickup") {
      form.setValue("address", "");
      form.setValue("city", "");
      form.setValue("state", "");
      form.setValue("postalCode", "");
    }
  };

  const onSubmit = async (data: CheckoutValues) => {
    if (deliveryMethod === "delivery" && !detectedLocation) {
      toast({
        title: "Delivery location not found",
        description:
          "We couldn't identify your delivery area from your address. Please check your city/state, or choose Pickup.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout/init", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          deliveryMethod,
          items: items.map((item) => ({
            variantId: item.variantId,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
          deliveryLocation:
            deliveryMethod === "pickup" ? "pickup" : detectedLocation?.id ?? "",
          shippingCost,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }

      const { orderId } = await res.json();
      if (!orderId) {
        throw new Error("Failed to create order");
      }

      window.location.href = `/checkout/payment?orderId=${orderId}`;
    } catch (error: any) {
      toast({
        title: "Checkout failed",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* --- Delivery Method Selector --- */}
        <div className="rounded-md border p-4 space-y-3">
          <h3 className="font-semibold">Delivery Method</h3>
          <RadioGroup
            value={deliveryMethod}
            onValueChange={(v) => handleDeliveryMethodChange(v as "delivery" | "pickup")}
            className="space-y-2"
          >
            <div className="flex items-center space-x-3 rounded-md border p-3 cursor-pointer hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="delivery" id="delivery" />
              <Label htmlFor="delivery" className="cursor-pointer flex-1">
                <div className="font-medium">Delivery</div>
                <div className="text-sm text-muted-foreground">
                  We'll deliver to your address
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-3 rounded-md border p-3 cursor-pointer hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="pickup" id="pickup" />
              <Label htmlFor="pickup" className="cursor-pointer flex-1">
                <div className="font-medium">Pickup</div>
                <div className="text-sm text-muted-foreground">
                  Collect your order from our store — free
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* --- Contact / Shipping Fields --- */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {deliveryMethod === "delivery" && (
          <>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input type="tel" inputMode="tel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Delivery info */}
        {deliveryMethod === "delivery" && (
          <div className="rounded-md border bg-muted/50 p-4 space-y-1">
            {detectedLocation ? (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery area</span>
                  <span className="font-medium">{detectedLocation.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery fee</span>
                  <span className="font-medium">
                    {shippingCost === 0
                      ? "Free"
                      : new Intl.NumberFormat("en-NG", {
                          style: "currency",
                          currency: "NGN",
                        }).format(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated delivery</span>
                  <span className="font-medium">{deliveryTimeframe}</span>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Make sure your address is correct.
              </p>
            )}
          </div>
        )}

        {deliveryMethod === "pickup" && (
          <div className="rounded-md border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              You'll be notified when your order is ready for pickup. Pickup is free.
            </p>
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Processing..." : "Place Order"}
        </Button>
      </form>
    </Form>
  );
}