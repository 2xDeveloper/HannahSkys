import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY in environment.");
  }

  if (!stripe) {
    stripe = new Stripe(key);
  }

  return stripe;
}

/** Platform commission on each sale (default 10%). */
export function getPlatformFeePercent(): number {
  const raw = process.env.STRIPE_PLATFORM_FEE_PERCENT ?? "10";
  const value = parseFloat(raw);
  if (Number.isNaN(value) || value < 0 || value > 100) {
    return 10;
  }
  return value;
}

export function calcPlatformFeeCents(amountCents: number): number {
  const percent = getPlatformFeePercent();
  return Math.round((amountCents * percent) / 100);
}
