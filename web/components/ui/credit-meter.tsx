import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

function level(ratio: number): "normal" | "low" | "empty" {
  if (ratio <= 0) return "empty";
  if (ratio < 0.1) return "low";
  return "normal";
}

const fillClass = { normal: "bg-accent", low: "bg-warning", empty: "bg-danger" };
const textClass = { normal: "text-text", low: "text-warning", empty: "text-danger" };

export function CreditMeterCompact({ remaining, monthly }: { remaining: number; monthly: number }) {
  const ratio = monthly > 0 ? remaining / monthly : 0;
  const lvl = level(ratio);
  return (
    <div className={cn("flex items-center gap-1.5 text-sm font-medium", textClass[lvl])}>
      <Zap className="size-4" aria-hidden />
      <span>{remaining.toLocaleString()}</span>
    </div>
  );
}

export function CreditMeterFull({ remaining, monthly, planName }: { remaining: number; monthly: number; planName: string }) {
  const ratio = monthly > 0 ? Math.min(remaining / monthly, 1) : 0;
  const lvl = level(ratio);
  return (
    <div role="group" aria-label="Credits remaining this billing period">
      <div className="flex items-baseline justify-between">
        <p className="text-sm text-muted">Credits on the {planName} plan</p>
        <p className={cn("text-sm font-semibold", textClass[lvl])}>
          {remaining.toLocaleString()} / {monthly.toLocaleString()}
        </p>
      </div>
      <div className="mt-2 h-2 w-full rounded-pill bg-surface" role="progressbar" aria-valuenow={remaining} aria-valuemin={0} aria-valuemax={monthly}>
        <div
          className={cn("h-full rounded-pill transition-all duration-base", fillClass[lvl])}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      {lvl !== "normal" && (
        <p className={cn("mt-1 text-xs", textClass[lvl])}>
          {lvl === "empty" ? "Out of credits — upgrade to keep generating." : "Running low this month."}
        </p>
      )}
    </div>
  );
}
