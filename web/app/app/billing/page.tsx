import { CreditMeterFull } from "@/components/ui/credit-meter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { plans, currentUser, planFor } from "@/lib/data/seed";

export default function BillingPage() {
  const plan = planFor(currentUser.planId);
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-lg font-semibold text-text">Billing</h1>
      <Card>
        <CreditMeterFull remaining={currentUser.creditsRemaining} monthly={plan.creditsPerMonth} planName={plan.name} />
      </Card>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {plans.map((p) => (
          <Card key={p.id} selected={p.id === plan.id}>
            <h2 className="text-base font-semibold text-text">{p.name}</h2>
            <p className="mt-1 text-2xl font-bold text-text">
              ${p.priceMonthly}
              <span className="text-sm font-normal text-muted">/mo</span>
            </p>
            <p className="mt-2 text-sm text-muted">{p.creditsPerMonth.toLocaleString()} credits / month</p>
            <p className="text-sm text-muted">{p.autopilotChannelLimit} autopilot channel{p.autopilotChannelLimit === 1 ? "" : "s"}</p>
            <Button variant={p.id === plan.id ? "secondary" : "primary"} className="mt-4 w-full" disabled={p.id === plan.id}>
              {p.id === plan.id ? "Current plan" : `Switch to ${p.name}`}
            </Button>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted">
        Checkout isn&apos;t wired to Stripe in this build pass (see architecture.md&apos;s build
        order, step 2) &mdash; these buttons are presentational only.
      </p>
    </div>
  );
}
