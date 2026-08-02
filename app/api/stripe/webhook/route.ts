import { Plan, SubscriptionStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

function mapStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "trialing":
      return SubscriptionStatus.TRIALING;
    case "active":
      return SubscriptionStatus.ACTIVE;
    case "past_due":
      return SubscriptionStatus.PAST_DUE;
    case "canceled":
      return SubscriptionStatus.CANCELED;
    default:
      return SubscriptionStatus.INCOMPLETE;
  }
}

function mapPlan(metadataPlan?: string | null): Plan {
  if (metadataPlan === "BUSINESS") return Plan.BUSINESS;
  if (metadataPlan === "PRO") return Plan.PRO;
  return Plan.FREE;
}

async function upsertFromSubscription(subscription: Stripe.Subscription) {
  const organizationId = subscription.metadata.organizationId;
  if (!organizationId) return;

  const priceId = subscription.items.data[0]?.price.id;
  const rawPeriodEnd =
    (subscription as Stripe.Subscription & { current_period_end?: number })
      .current_period_end ??
    (
      subscription.items.data[0] as
        | (Stripe.SubscriptionItem & { current_period_end?: number })
        | undefined
    )?.current_period_end;
  const periodEnd = rawPeriodEnd ? new Date(rawPeriodEnd * 1000) : null;

  await prisma.subscription.upsert({
    where: { organizationId },
    create: {
      organizationId,
      plan: mapPlan(subscription.metadata.plan),
      status: mapStatus(subscription.status),
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    update: {
      plan: mapPlan(subscription.metadata.plan),
      status: mapStatus(subscription.status),
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 400 },
    );
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error("[stripe/webhook] signature", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const checkout = event.data.object as Stripe.Checkout.Session;
        if (checkout.subscription && typeof checkout.subscription === "string") {
          const subscription = await stripe.subscriptions.retrieve(
            checkout.subscription,
          );
          if (checkout.metadata?.organizationId) {
            subscription.metadata.organizationId =
              checkout.metadata.organizationId;
          }
          if (checkout.metadata?.plan) {
            subscription.metadata.plan = checkout.metadata.plan;
          }
          await upsertFromSubscription(subscription);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        await upsertFromSubscription(event.data.object as Stripe.Subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const organizationId = subscription.metadata.organizationId;
        if (organizationId) {
          await prisma.subscription.update({
            where: { organizationId },
            data: {
              plan: Plan.FREE,
              status: SubscriptionStatus.CANCELED,
              cancelAtPeriodEnd: false,
              stripeSubscriptionId: null,
              stripePriceId: null,
            },
          });
        }
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("[stripe/webhook] handler", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
