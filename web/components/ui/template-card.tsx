import { Lock, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "./card";

export function TemplateCard({
  icon: Icon,
  title,
  description,
  locked,
  selected,
  badge,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  locked?: boolean;
  selected?: boolean;
  badge?: string;
  onClick?: () => void;
}) {
  return (
    <Card
      interactive={!locked}
      selected={selected}
      className={cn("relative", locked && "opacity-40")}
    >
      <button
        type="button"
        disabled={locked}
        onClick={onClick}
        aria-pressed={selected}
        className="flex w-full flex-col items-start gap-2 text-left disabled:cursor-not-allowed"
      >
        <Icon className="size-6 text-accent" aria-hidden />
        <h3 className="text-base font-semibold text-text">{title}</h3>
        <p className="text-sm text-muted">{description}</p>
        {locked && (
          <span className="absolute right-4 top-4 flex items-center gap-1 text-xs text-muted">
            <Lock className="size-3.5" aria-hidden /> Upgrade to unlock
          </span>
        )}
        {!locked && badge && (
          <span className="absolute right-4 top-4 rounded-pill border border-success/30 bg-success/15 px-2 py-0.5 text-xs text-success">
            {badge}
          </span>
        )}
      </button>
    </Card>
  );
}
