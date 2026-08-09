"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

type DeliveryLocation = {
  id: string;
  label: string;
  cost: number;
  keywords?: string[];
};

type SettingsState = {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  shippingRate: number;
  taxRate: number;
  deliveryLocations: DeliveryLocation[];
  deliveryTimeframe: string;
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
    deliveryLocations: [],
    deliveryTimeframe: "3-5 business days",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings((prev) => ({
          ...prev,
          ...data,
          deliveryLocations: Array.isArray(data.deliveryLocations)
            ? data.deliveryLocations
            : [],
        }));
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
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
          <div>
            <Label>Delivery Timeframe</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Shown to customers at checkout (e.g. "3-5 business days"
              or "Aug 16-20").
            </p>
            <Input
              value={settings.deliveryTimeframe}
              onChange={(e) =>
                setSettings({ ...settings, deliveryTimeframe: e.target.value })
              }
              placeholder="3-5 business days"
            />
          </div>
          <div>
            <Label>Delivery Locations</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Add keywords (comma-separated) to auto-detect the location from a
              customer's address.
            </p>
            <div className="space-y-3 mt-2">
              {settings.deliveryLocations.map((location, index) => (
                <div key={location.id} className="space-y-2 rounded-md border p-3">
                  <div className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-5">
                      <Label className="text-xs">Label</Label>
                      <Input
                        placeholder="e.g. Maitama"
                        value={location.label}
                        onChange={(e) => {
                          const updated = [...settings.deliveryLocations];
                          updated[index] = {
                            ...updated[index],
                            label: e.target.value,
                          };
                          setSettings({
                            ...settings,
                            deliveryLocations: updated,
                          });
                        }}
                      />
                    </div>
                    <div className="col-span-5">
                      <Label className="text-xs">Cost (NGN)</Label>
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="3000"
                        value={location.cost}
                        onChange={(e) => {
                          const updated = [...settings.deliveryLocations];
                          updated[index] = {
                            ...updated[index],
                            cost: Number(e.target.value),
                          };
                          setSettings({
                            ...settings,
                            deliveryLocations: updated,
                          });
                        }}
                      />
                    </div>
                    <div className="col-span-2">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setSettings({
                            ...settings,
                            deliveryLocations:
                              settings.deliveryLocations.filter(
                                (_, i) => i !== index,
                              ),
                          });
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Keywords</Label>
                    <Input
                      placeholder="maitama, maitama extension, aminu kano"
                      value={(location.keywords ?? []).join(", ")}
                      onChange={(e) => {
                        const updated = [...settings.deliveryLocations];
                        updated[index] = {
                          ...updated[index],
                          keywords: e.target.value
                            .split(",")
                            .map((k) => k.trim())
                            .filter(Boolean),
                        };
                        setSettings({
                          ...settings,
                          deliveryLocations: updated,
                        });
                      }}
                    />
                  </div>
                </div>
              ))}
              <Button
                variant="secondary"
                onClick={() => {
                  setSettings({
                    ...settings,
                    deliveryLocations: [
                      ...settings.deliveryLocations,
                      {
                        id:
                          crypto.randomUUID?.() ??
                          `${Date.now()}-${settings.deliveryLocations.length}`,
                        label: "",
                        cost: 0,
                      },
                    ],
                  });
                }}
              >
                Add location
              </Button>
            </div>
          </div>
          <Button onClick={handleSave}>Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
