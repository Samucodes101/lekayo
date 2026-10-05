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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useActiveCart } from "@/hooks/useActiveCart";
import { toast } from "@/hooks/use-toast";
import { type DeliveryState } from "@/lib/deliveryLocations";

const formatNaira = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

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
  deliveryStates: DeliveryState[];
  onShippingChange?: (shippingCost: number) => void;
};

export default function CheckoutForm({
  deliveryStates,
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

  const [deliveryOptionId, setDeliveryOptionId] = useState("");
  const state = form.watch("state");

  // Only states with at least one option can be delivered to.
  const availableStates = useMemo(
    () =>
      deliveryStates
        .filter((st) => st.options.length > 0)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [deliveryStates],
  );

  const selectedState = availableStates.find((st) => st.name === state);
  const selectedOption =
    deliveryMethod === "delivery"
      ? selectedState?.options.find((o) => o.id === deliveryOptionId)
      : undefined;

  // Default to the first option whenever the state changes.
  useEffect(() => {
    setDeliveryOptionId(selectedState?.options[0]?.id ?? "");
  }, [selectedState]);

  const shippingCost =
    deliveryMethod === "pickup" ? 0 : selectedOption?.cost ?? 0;

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
    if (deliveryMethod === "delivery" && !selectedOption) {
      toast({
        title: "Select a shipping method",
        description:
          "Please choose your state and a shipping method, or choose Pickup.",
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
            deliveryMethod === "pickup" ? "pickup" : selectedOption?.id ?? "",
          shippingCost,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        if (error?.shortItems && Array.isArray(error.shortItems)) {
          const list = error.shortItems
            .map(
              (s: any) =>
                `${s.name} — requested ${s.requested}, only ${s.available} left`,
            )
            .join("\n");
          throw new Error(
            `Some items are no longer available:\n${list}`,
          );
        }
        throw new Error(error?.error || "Failed to create order");
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableStates.map((st) => (
                          <SelectItem key={st.id} value={st.name}>
                            {st.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

        {/* Shipping method for the selected state */}
        {deliveryMethod === "delivery" && (
          <div className="space-y-3">
            <h3 className="font-semibold">Shipping method</h3>
            {selectedState ? (
              <RadioGroup
                value={deliveryOptionId}
                onValueChange={setDeliveryOptionId}
                className="space-y-0 overflow-hidden rounded-md border"
              >
                {selectedState.options.map((option) => (
                  <Label
                    key={option.id}
                    htmlFor={`ship-${option.id}`}
                    className={`flex cursor-pointer items-start gap-3 border-b p-4 font-normal last:border-b-0 ${
                      option.id === deliveryOptionId ? "bg-muted/50" : ""
                    }`}
                  >
                    <RadioGroupItem
                      value={option.id}
                      id={`ship-${option.id}`}
                      className="mt-0.5"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between gap-3">
                        <span className="font-medium uppercase">
                          {option.label}
                        </span>
                        <span className="whitespace-nowrap font-medium">
                          {option.cost === 0 ? "Free" : formatNaira(option.cost)}
                        </span>
                      </div>
                      {option.description && (
                        <p className="whitespace-pre-line text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      )}
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            ) : (
              <p className="rounded-md border bg-muted/50 p-4 text-sm text-muted-foreground">
                {availableStates.length > 0
                  ? "Select your state to see available shipping methods."
                  : "Delivery is not available right now. Please choose Pickup."}
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