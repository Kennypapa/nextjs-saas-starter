import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { appUrl } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 503 },
      );
    }

    const org = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
    });

    if (!org?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No billing customer yet. Subscribe to a plan first." },
        { status: 400 },
      );
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: org.stripeCustomerId,
      return_url: appUrl("/dashboard/billing"),
    });

    return NextResponse.json({ url: portal.url });
  } catch (error) {
    console.error("[stripe/portal]", error);
    return NextResponse.json(
      { error: "Unable to open billing portal" },
      { status: 500 },
    );
  }
}
