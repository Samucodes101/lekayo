"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

type OrderSummary = {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    name: string;
  }[];
};

function PaymentContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentGateway, setPaymentGateway] = useState("PAYSTACK");

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    fetch(`/api/checkout/order/${orderId}/summary`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          toast({
            title: "Error",
            description: data.error,
            variant: "destructive",
          });
        } else {
          setOrder(data);
        }
      })
      .catch((err) => {
        console.error("Failed to load order:", err);
        toast({
          title: "Error",
          description: "Failed to load order details.",
          variant: "destructive",
        });
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  const handlePay = async () => {
    if (!orderId) return;
    setPaying(true);
    try {
      const res = await fetch("/api/checkout/pay", {
        method: "POST",
        body: JSON.stringify({ orderId, paymentGateway }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Payment initialization failed");
      }

      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        throw new Error("No authorization URL returned");
      }
    } catch (error: any) {
      toast({
        title: "Payment failed",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Skeleton className="h-10 w-48 mb-6" />
        <Skeleton className="h-64 w-full mb-6" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4">
          No order specified. Please complete the checkout form first.
        </p>
        <Button asChild>
          <a href="/checkout">Go to checkout</a>
        </Button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4">
          Order not found. It may have been removed or the link is invalid.
        </p>
        <Button asChild>
          <a href="/checkout">Go to checkout</a>
        </Button>
      </div>
    );
  }

  const formatNaira = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-serif mb-2">Payment</h1>
      <p className="text-muted-foreground mb-6">
        {/* Order {order.orderNumber} — choose a payment method to continue. */}
      </p>

      {/* Order summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between text-sm border-b pb-2"
            >
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{formatNaira(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm pt-1">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatNaira(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span className="text-muted-foreground">Flash Sale Discount</span>
              <span>-{formatNaira(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery fee</span>
            <span>{formatNaira(order.shippingCost)}</span>
          </div>
          <div className="flex justify-between font-semibold text-base pt-2 border-t">
            <span>Total</span>
            <span>{formatNaira(order.total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment method selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={paymentGateway}
            onValueChange={setPaymentGateway}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3 rounded-md border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="PAYSTACK" id="paystack" />
              <Label htmlFor="paystack" className="cursor-pointer flex-1">
                <div className="font-medium">Paystack</div>
                <div className="text-sm text-muted-foreground">
                  Pay with card, bank transfer, or USSD
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-3 rounded-md border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="FLUTTERWAVE" id="flutterwave" />
              <Label htmlFor="flutterwave" className="cursor-pointer flex-1">
                <div className="font-medium">Flutterwave</div>
                <div className="text-sm text-muted-foreground">
                  Pay with card, bank account, or mobile money
                </div>
              </Label>
            </div>
          </RadioGroup>

          <Button
            onClick={handlePay}
            disabled={paying}
            className="w-full"
            size="lg"
          >
            {paying
              ? "Initializing payment..."
              : `Pay ${formatNaira(order.total)}`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16 text-center">
          Loading...
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}