"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  NIGERIAN_STATES,
  type DeliveryOption,
  type DeliveryState,
} from "@/lib/deliveryLocations";

const newId = () =>
  crypto.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

type SettingsState = {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  shippingRate: number;
  taxRate: number;
  deliveryStates: DeliveryState[];
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>({
    siteName: "Lekayo",
    siteDescription: "Luxury fashion destination",
    contactEmail: "",
    contactPhone: "",
    address: "",
    shippingRate: 0,
    taxRate: 0,
    deliveryStates: [],
  });
  const [loading, setLoading] = useState(true);
  const [stateToAdd, setStateToAdd] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings((prev) => ({
          siteName: data.siteName ?? prev.siteName,
          siteDescription: data.siteDescription ?? prev.siteDescription,
          contactEmail: data.contactEmail ?? prev.contactEmail,
          contactPhone: data.contactPhone ?? prev.contactPhone,
          address: data.address ?? prev.address,
          shippingRate: data.shippingRate ?? prev.shippingRate,
          taxRate: data.taxRate ?? prev.taxRate,
          deliveryStates: Array.isArray(data.deliveryStates)
            ? data.deliveryStates
            : [],
        }));
        setLoading(false);
      });
  }, []);

  const updateState = (stateId: string, patch: Partial<DeliveryState>) =>
    setSettings((prev) => ({
      ...prev,
      deliveryStates: prev.deliveryStates.map((st) =>
        st.id === stateId ? { ...st, ...patch } : st,
      ),
    }));

  const updateOption = (
    stateId: string,
    optionId: string,
    patch: Partial<DeliveryOption>,
  ) =>
    setSettings((prev) => ({
      ...prev,
      deliveryStates: prev.deliveryStates.map((st) =>
        st.id === stateId
          ? {
              ...st,
              options: st.options.map((o) =>
                o.id === optionId ? { ...o, ...patch } : o,
              ),
            }
          : st,
      ),
    }));

  const addState = () => {
    if (!stateToAdd) return;
    setSettings((prev) => ({
      ...prev,
      deliveryStates: [
        ...prev.deliveryStates,
        { id: newId(), name: stateToAdd, options: [] },
      ],
    }));
    setStateToAdd("");
  };

  const availableStates = NIGERIAN_STATES.filter(
    (name) => !settings.deliveryStates.some((st) => st.name === name),
  );

  const handleSave = async () => {
    const invalid = settings.deliveryStates.some((st) =>
      st.options.some((o) => !o.label.trim()),
    );
    if (invalid) {
      toast({
        title: "Every delivery option needs an address/name",
        variant: "destructive",
      });
      return;
    }
    const res = await fetch("/api/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      toast({ title: "Settings saved" });
    } else {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Site Name</Label>
            <Input
              value={settings.siteName}
              onChange={(e) =>
                setSettings({ ...settings, siteName: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Site Description</Label>
            <Input
              value={settings.siteDescription}
              onChange={(e) =>
                setSettings({ ...settings, siteDescription: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Contact Email</Label>
            <Input
              type="email"
              value={settings.contactEmail}
              onChange={(e) =>
                setSettings({ ...settings, contactEmail: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Contact Phone</Label>
            <Input
              value={settings.contactPhone}
              onChange={(e) =>
                setSettings({ ...settings, contactPhone: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Address</Label>
            <Input
              value={settings.address}
              onChange={(e) =>
                setSettings({ ...settings, address: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Shipping Rate (NGN)</Label>
            <Input
              type="number"
              step="0.01"
              value={settings.shippingRate}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  shippingRate: Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <Label>Tax Rate (%)</Label>
            <Input
              type="number"
              step="0.01"
              value={settings.taxRate}
              onChange={(e) =>
                setSettings({ ...settings, taxRate: Number(e.target.value) })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delivery States &amp; Fees</CardTitle>
          <p className="text-sm text-muted-foreground">
            Customers pick their state at checkout, then choose one of the
            delivery options you add for that state.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.deliveryStates.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No delivery states yet. Customers will only be able to choose
              pickup.
            </p>
          )}

          {settings.deliveryStates.map((st) => (
            <div key={st.id} className="space-y-3 rounded-md border p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">{st.name}</h3>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setSettings((prev) => ({
                      ...prev,
                      deliveryStates: prev.deliveryStates.filter(
                        (s) => s.id !== st.id,
                      ),
                    }))
                  }
                >
                  Remove state
                </Button>
              </div>

              {st.options.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No delivery options. This state won&apos;t appear at checkout
                  until you add one.
                </p>
              )}

              {st.options.map((option) => (
                <div
                  key={option.id}
                  className="space-y-2 rounded-md border bg-muted/30 p-3"
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-end">
                    <div className="sm:col-span-7">
                      <Label className="text-xs">Address / location</Label>
                      <Input
                        placeholder="e.g. Apo Resettlement GUO Terminal Pickup"
                        value={option.label}
                        onChange={(e) =>
                          updateOption(st.id, option.id, {
                            label: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <Label className="text-xs">Fee (NGN)</Label>
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="7000"
                        value={option.cost}
                        onChange={(e) =>
                          updateOption(st.id, option.id, {
                            cost: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() =>
                          updateState(st.id, {
                            options: st.options.filter(
                              (o) => o.id !== option.id,
                            ),
                          })
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">
                      Expected delivery timeline / notes
                    </Label>
                    <Textarea
                      rows={2}
                      placeholder="Delivery takes 5-15 business days. You might be asked to balance up on your delivery fee if it weighs higher than 2kg"
                      value={option.description}
                      onChange={(e) =>
                        updateOption(st.id, option.id, {
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateState(st.id, {
                    options: [
                      ...st.options,
                      { id: newId(), label: "", cost: 0, description: "" },
                    ],
                  })
                }
              >
                Add delivery option
              </Button>
            </div>
          ))}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Select value={stateToAdd} onValueChange={setStateToAdd}>
              <SelectTrigger className="sm:w-72">
                <SelectValue placeholder="Select a state to add" />
              </SelectTrigger>
              <SelectContent>
                {availableStates.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="secondary"
              onClick={addState}
              disabled={!stateToAdd}
            >
              Add state
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave}>Save Settings</Button>
    </div>
  );
}
