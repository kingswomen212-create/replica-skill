"use client";

import { RefreshCw, GripVertical, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export type SceneStatus = "pending" | "generating" | "ready" | "failed";

export function SceneCard({
  index,
  status,
  thumbnailUrl,
  scriptText,
  onRegenerate,
}: {
  index: number;
  status: SceneStatus;
  thumbnailUrl?: string;
  scriptText: string;
  onRegenerate?: () => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-border bg-surface p-3">
      <button
        type="button"
        aria-label={`Reorder scene ${index + 1}`}
        className="mt-1 text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
      >
        <GripVertical className="size-4" aria-hidden />
      </button>

      <div
        className={cn(
          "size-16 shrink-0 overflow-hidden rounded-md bg-surface-raised",
          status === "generating" && "animate-pulse"
        )}
      >
        {thumbnailUrl && status === "ready" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnailUrl} alt={`Scene ${index + 1} preview`} className="size-full object-cover" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted">Scene {index + 1}</p>
        <p className="truncate text-sm text-text">{scriptText || "Untitled scene"}</p>
        {status === "failed" && (
          <p className="mt-1 flex items-center gap-1 text-xs text-danger">
            <AlertCircle className="size-3.5" aria-hidden /> Couldn&apos;t generate this scene.
          </p>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        aria-label={`Regenerate scene ${index + 1}`}
        onClick={onRegenerate}
        loading={status === "generating"}
        disabled={status === "generating"}
      >
        <RefreshCw className="size-4" aria-hidden />
        {status === "failed" ? "Retry" : "Regenerate"}
      </Button>
    </div>
  );
}
