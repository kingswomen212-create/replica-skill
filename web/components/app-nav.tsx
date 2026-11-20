import Link from "next/link";
import { Clapperboard, Radio, CreditCard, Settings } from "lucide-react";
import { CreditMeterCompact } from "@/components/ui/credit-meter";
import { currentUser, planFor } from "@/lib/data/seed";

export function AppNav() {
  const plan = planFor(currentUser.planId);
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-bg/95 px-6 backdrop-blur">
      <div className="flex items-center gap-8">
        <Link href="/app" className="flex items-center gap-2 font-semibold text-text">
          <Clapperboard className="size-5 text-accent" aria-hidden />
          <span>Reel Clone</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-muted sm:flex">
          <Link href="/app" className="hover:text-text">Create</Link>
          <Link href="/app/autopilot" className="flex items-center gap-1 hover:text-text">
            <Radio className="size-3.5" aria-hidden /> Autopilot
          </Link>
          <Link href="/app/billing" className="flex items-center gap-1 hover:text-text">
            <CreditCard className="size-3.5" aria-hidden /> Billing
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <CreditMeterCompact remaining={currentUser.creditsRemaining} monthly={plan.creditsPerMonth} />
        <Link
          href="/app/settings"
          aria-label="Account settings"
          className="rounded-md p-2 text-muted hover:bg-surface hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Settings className="size-4" aria-hidden />
        </Link>
      </div>
    </header>
  );
}
