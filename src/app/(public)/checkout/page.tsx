"use client";

import { useState, useEffect } from "react";
import { useActiveCart } from "@/hooks/useActiveCart";
import CheckoutForm from "@/components/forms/CheckoutForm";
import OrderSummary from "@/components/shared/OrderSummary";
import {
  defaultDeliveryLocations,
  DeliveryLocation,
} from "@/lib/deliveryLocations";

export default function CheckoutPage() {
  const { items, isHydrated } = useActiveCart();
  const [isReady, setIsReady] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [deliveryLocations, setDeliveryLocations] = useState<
    DeliveryLocation[]
  >(defaultDeliveryLocations);
  const [deliveryTimeframe, setDeliveryTimeframe] = useState(
    "3-5 business days",
  );

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) return;
        const data = await res.json();
        if (
          Array.isArray(data.deliveryLocations) &&
          data.deliveryLocations.length > 0
        ) {
          setDeliveryLocations(data.deliveryLocations);
        }
        if (typeof data.deliveryTimeframe === "string" && data.deliveryTimeframe) {
          setDeliveryTimeframe(data.deliveryTimeframe);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };

    loadSettings();
  }, []);

  if (!isHydrated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        Loading cart…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        Your cart is empty.
      </div>
    );
  }

  if (!isReady)
    return (
      <div className="container mx-auto px-4 py-16">
        Loading checkout...
      </div>
    );

  // Compute subtotal and discount from cart items
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = items.reduce((sum, item) => {
    if (item.originalPrice > item.price) {
      return sum + (item.originalPrice - item.price) * item.quantity;
    }
    return sum;
  }, 0);
  const total = subtotal + shippingCost;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif mb-6">Checkout</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <CheckoutForm
          deliveryLocations={deliveryLocations}
          deliveryTimeframe={deliveryTimeframe}
          onShippingChange={setShippingCost}
        />
        <div>
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <OrderSummary
            subtotal={subtotal}
            discount={discount}
            shipping={shippingCost}
            total={total}
          />
        </div>
      </div>
    </div>
  );
}