"use client";

import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const plans = [
  { id: "pro", name: "Pro", price: "$29/mo" },
  { id: "business", name: "Business", price: "$99/mo" },
];

export default function BillingPage() {
  async function handleCheckout(planId: string) {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error ?? "Failed to start checkout");
      return;
    }

    const { url } = await res.json();
    if (url) {
      window.location.href = url;
    }
  }

  async function handlePortal() {
    const res = await fetch("/api/stripe/portal", { method: "POST" });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error ?? "Failed to open billing portal");
      return;
    }

    const { url } = await res.json();
    if (url) {
      window.location.href = url;
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Manage your subscription and payment methods
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
          <CardDescription>Your active subscription details</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">Free</span>
              <Badge variant="secondary">Active</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Upgrade to unlock advanced features
            </p>
          </div>
          <Button variant="outline" onClick={handlePortal}>
            Manage billing
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.price}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => handleCheckout(plan.id)}>
                Upgrade to {plan.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
