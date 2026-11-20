import { NextRequest, NextResponse } from "next/server";
import { getPriceCents, isPaymentConfigured, stripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    configured: isPaymentConfigured(),
    priceCents: isPaymentConfigured() ? getPriceCents() : null,
  });
}

export async function POST(req: NextRequest) {
  if (!isPaymentConfigured()) {
    return NextResponse.json({ error: "payments not configured" }, { status: 503 });
  }

  const origin = req.headers.get("origin") ?? new URL(req.url).origin;
  const stripe = stripeClient();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: getPriceCents(),
            product_data: {
              name: "1 AI faceless short video",
              description: "Script, AI visuals, voiceover and captions, generated and composited into one video.",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/app/create/faceless?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/app/create/faceless?canceled=1`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "checkout session had no URL" }, { status: 502 });
    }
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "checkout failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
