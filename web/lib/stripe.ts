// Server-only. STRIPE_SECRET_KEY and STRIPE_PRICE_CENTS are environment
// variables set on the hosting platform (Railway/Render/etc), never
// committed. Until STRIPE_SECRET_KEY is set, the paygate stays off and
// generation is free -- see app/api/checkout/route.ts and
// app/api/generate-faceless/route.ts, both check isPaymentConfigured()
// the same way, so the app never breaks for lack of a key, it just
// doesn't charge yet.
import Stripe from "stripe";

export function isPaymentConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getPriceCents(): number {
  const raw = process.env.STRIPE_PRICE_CENTS;
  const parsed = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 200; // default $2.00
}

let client: Stripe | null = null;
export function stripeClient(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    client = new Stripe(key);
  }
  return client;
}

// In-memory record of Checkout Sessions already redeemed for a
// generation. No database yet (see build-log.md), so this only survives
// for the life of one server process -- fine for a single-instance
// deploy, would need a real store (Supabase, Redis, etc.) behind more
// than one instance or a restart-heavy host.
const redeemedSessions = new Set<string>();

export function markSessionRedeemed(sessionId: string) {
  redeemedSessions.add(sessionId);
}

export function wasSessionRedeemed(sessionId: string): boolean {
  return redeemedSessions.has(sessionId);
}
