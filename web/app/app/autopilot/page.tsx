"use client";

import { Radio, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ChannelCard } from "@/components/channel-card";
import { useAutopilotRuns, useChannels } from "@/lib/data/use-channels";
import type { AutopilotRunStatus } from "@/lib/data/types";

const RUN_ICON: Record<AutopilotRunStatus, typeof CheckCircle2> = {
  published: CheckCircle2,
  failed: XCircle,
  generating: Loader2,
  idea_picked: Loader2,
};

export default function AutopilotPage() {
  const channels = useChannels();
  const runs = useAutopilotRuns();
  const activeChannels = channels.filter((c) => c.autopilotEnabled);

  return (
    <div className="max-w-2xl">
      <h1 className="flex items-center gap-2 text-lg font-semibold text-text">
        <Radio className="size-5 text-accent" aria-hidden /> Autopilot
      </h1>
      <p className="mt-1 text-sm text-muted">
        Connect a channel, set a niche and a posting cadence, and the pipeline generates and
        publishes on a schedule, unattended.
      </p>

      <p className="mt-2 text-xs text-muted">
        Connecting here simulates the OAuth round trip; no real platform account is touched. Scheduled runs below are seeded as soon as you turn autopilot on, not actually fired on a timer.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {channels.map((c) => (
          <ChannelCard key={c.id} channel={c} />
        ))}
      </div>

      {activeChannels.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-medium text-muted">Recent autopilot runs</h2>
          <div className="mt-2 space-y-2">
            {runs.length === 0 ? (
              <Card><p className="text-sm text-muted">No runs yet — the next one fires on the schedule you set.</p></Card>
            ) : (
              runs.map((r) => {
                const channel = channels.find((c) => c.id === r.channelId);
                const Icon = RUN_ICON[r.status];
                return (
                  <Card key={r.id} className="flex items-center gap-3">
                    <Icon
                      className={`size-4 shrink-0 ${r.status === "published" ? "text-success" : r.status === "failed" ? "text-danger" : "animate-spin text-accent"}`}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-text">{r.videoTitle}</p>
                      <p className="text-xs text-muted">
                        {channel?.platform} &middot; {new Date(r.runAt).toLocaleString()}
                      </p>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
