import { NextRequest, NextResponse } from "next/server";
import { runFreePipeline } from "@/lib/ai/free-pipeline";
import { isPaymentConfigured, markSessionRedeemed, stripeClient, wasSessionRedeemed } from "@/lib/stripe";

export const runtime = "nodejs";
// 4 scenes, images paced 1-per-45s (the free image API's rate limit) +
// script/voice/compose time -- realistically 3-4 minutes end to end.
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  let body: { idea?: string; style?: string; sessionId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const idea = (body.idea ?? "").trim();
  const style = (body.style ?? "cinematic").trim();
  if (idea.length < 4) {
    return NextResponse.json({ error: "idea is too short" }, { status: 400 });
  }

  // Paygate: a no-op (free) until STRIPE_SECRET_KEY is set on the host.
  // Once it is, every generation needs a paid, unredeemed Checkout
  // Session id, verified against Stripe itself (not just trusted from
  // the client) and marked redeemed so the same session can't be reused.
  if (isPaymentConfigured()) {
    const sessionId = body.sessionId;
    if (!sessionId) {
      return NextResponse.json({ error: "payment required" }, { status: 402 });
    }
    if (wasSessionRedeemed(sessionId)) {
      return NextResponse.json({ error: "this payment was already used for a video" }, { status: 402 });
    }
    try {
      const session = await stripeClient().checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== "paid") {
        return NextResponse.json({ error: "payment not completed" }, { status: 402 });
      }
    } catch {
      return NextResponse.json({ error: "couldn't verify payment" }, { status: 402 });
    }
    markSessionRedeemed(sessionId);
  }

  try {
    const result = await runFreePipeline(idea, style);
    return new NextResponse(new Uint8Array(result.videoBuffer), {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": 'attachment; filename="reel-clone-short.mp4"',
        "X-Scenes": encodeURIComponent(JSON.stringify(result.scenes)),
        "X-Warnings": encodeURIComponent(JSON.stringify(result.warnings)),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "generation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
