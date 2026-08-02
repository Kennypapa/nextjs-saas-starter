import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  typescript: true,
});

export const PLANS = {
  FREE: {
    name: "Free",
    priceId: null as string | null,
    price: 0,
    description: "For trying the product",
  },
  PRO: {
    name: "Pro",
    priceId: process.env.STRIPE_PRICE_PRO ?? "",
    price: 29,
    description: "For growing teams",
  },
  BUSINESS: {
    name: "Business",
    priceId: process.env.STRIPE_PRICE_BUSINESS ?? "",
    price: 99,
    description: "For scaled organizations",
  },
} as const;

export type PlanKey = keyof typeof PLANS;
