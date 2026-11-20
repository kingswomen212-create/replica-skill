import { cn } from "@/lib/utils";

type Variant = "default" | "accent" | "success" | "warning" | "danger";

const variantClasses: Record<Variant, string> = {
  default: "bg-surface border border-border text-muted",
  accent: "bg-accent/15 text-accent border border-accent/30",
  success: "bg-success/15 text-success border border-success/30",
  warning: "bg-warning/15 text-warning border border-warning/30",
  danger: "bg-danger/15 text-danger border border-danger/30",
};

export function Badge({
  variant = "default",
  className,
  children,
}: {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
