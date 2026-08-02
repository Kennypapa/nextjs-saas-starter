import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS, type PlanKey, stripe } from "@/lib/stripe";
import { appUrl } from "@/lib/mail";

const bodySchema = z.object({
  plan: z.enum(["PRO", "BUSINESS"]),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured. Set STRIPE_SECRET_KEY." },
        { status: 503 },
      );
    }

    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const plan = parsed.data.plan as PlanKey;
    const priceId = PLANS[plan].priceId;
    if (!priceId) {
      return NextResponse.json(
        { error: `Missing Stripe price for ${plan}. Set STRIPE_PRICE_${plan}.` },
        { status: 503 },
      );
    }

    const org = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
    });
    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    let customerId = org.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email ?? undefined,
        name: org.name,
        metadata: { organizationId: org.id },
      });
      customerId = customer.id;
      await prisma.organization.update({
        where: { id: org.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: appUrl("/dashboard/billing?success=1"),
      cancel_url: appUrl("/dashboard/billing?canceled=1"),
      metadata: {
        organizationId: org.id,
        plan,
      },
      subscription_data: {
        metadata: {
          organizationId: org.id,
          plan,
        },
      },
    });

    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error("[stripe/checkout]", error);
    return NextResponse.json(
      { error: "Unable to start checkout" },
      { status: 500 },
    );
  }
}
