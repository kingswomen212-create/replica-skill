import { cn } from "@/lib/utils";

export function Card({
  className,
  selected,
  interactive,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { selected?: boolean; interactive?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-surface p-5 transition-colors duration-fast",
        interactive && "hover:bg-surface-raised hover:border-border-input cursor-pointer",
        selected ? "border-accent bg-accent/10" : "border-border",
        className
      )}
      {...props}
    />
  );
}
