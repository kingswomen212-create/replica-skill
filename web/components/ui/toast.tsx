"use client";

import { CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Kind = "success" | "error" | "info";

const config: Record<Kind, { icon: typeof CheckCircle2; border: string; role: "status" | "alert" }> = {
  success: { icon: CheckCircle2, border: "border-l-success", role: "status" },
  info: { icon: Info, border: "border-l-accent", role: "status" },
  error: { icon: XCircle, border: "border-l-danger", role: "alert" },
};

export function Toast({ kind = "info", title, description }: { kind?: Kind; title: string; description?: string }) {
  const { icon: Icon, border, role } = config[kind];
  return (
    <div
      role={role}
      className={cn(
        "flex items-start gap-3 rounded-md border-l-[3px] bg-surface-raised px-4 py-3 shadow-pop",
        border
      )}
    >
      <Icon className="size-5 shrink-0 text-text" aria-hidden />
      <div>
        <p className="text-sm font-medium text-text">{title}</p>
        {description && <p className="text-xs text-muted">{description}</p>}
      </div>
    </div>
  );
}

export function LowCreditToast({ remaining }: { remaining: number }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-md border-l-[3px] border-l-warning bg-surface-raised px-4 py-3 shadow-pop">
      <AlertTriangle className="size-5 shrink-0 text-warning" aria-hidden />
      <div>
        <p className="text-sm font-medium text-text">Running low on credits</p>
        <p className="text-xs text-muted">{remaining} credits left this month.</p>
      </div>
    </div>
  );
}
