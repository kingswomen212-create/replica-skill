import Link from "next/link";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { plans } from "@/lib/data/seed";

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div className="text-center">
        <h1 className="text-display font-bold text-text">Pick your scale.</h1>
        <p className="mt-3 text-muted">
          Every plan gets every template, every voice and style, and 4K export with no watermark.
          The only difference is how many credits you get and how many channels run on autopilot.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {plans.map((p, i) => (
          <Card key={p.id} selected={i === 1} className="relative">
            {i === 1 && (
              <Badge variant="accent" className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most popular
              </Badge>
            )}
            <h2 className="text-lg font-semibold text-text">{p.name}</h2>
            <p className="mt-2 text-3xl font-bold text-text">
              ${p.priceMonthly}
              <span className="text-sm font-normal text-muted"> / month</span>
            </p>
            <p className="mt-1 text-sm text-muted">{p.creditsPerMonth.toLocaleString()} credits / month</p>
            <ul className="mt-6 space-y-2 text-sm text-text">
              <li className="flex items-center gap-2">
                <Check className="size-4 text-success" aria-hidden /> Every template
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-success" aria-hidden /> 4K export, no watermark
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-success" aria-hidden />
                {p.autopilotChannelLimit} autopilot channel{p.autopilotChannelLimit === 1 ? "" : "s"}
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-success" aria-hidden /> Bring your own AI keys
              </li>
            </ul>
            <Button asChild variant={i === 1 ? "primary" : "secondary"} className="mt-6 w-full" pill>
              <Link href="/signup">Get {p.name}</Link>
            </Button>
            <p className="mt-2 text-center text-xs text-muted">Cancel or change plan anytime</p>
          </Card>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-muted">
        Credits scale with how much the video actually costs to generate — a 30-second short
        uses fewer than a 20-minute long-form video. Unused credits never expire.
      </p>
    </main>
  );
}
