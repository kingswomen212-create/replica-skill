"use client";

import { useState } from "react";
import { PlaySquare, Music2, Camera, Users, AtSign, Hash, Loader2 } from "lucide-react";
import type { Channel, Platform } from "@/lib/data/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { connectChannel, disconnectChannel, setAutopilot } from "@/lib/data/channels-client";

// Generic, non-branded icons -- not the platforms' own logos (trademarked,
// and most aren't even exported by this lucide-react version anyway).
const PLATFORM_ICON: Record<Platform, typeof PlaySquare> = {
  youtube: PlaySquare,
  tiktok: Music2,
  instagram: Camera,
  facebook: Users,
  threads: AtSign,
  x: Hash,
};

const PLATFORM_LABEL: Record<Platform, string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  instagram: "Instagram",
  facebook: "Facebook",
  threads: "Threads",
  x: "X",
};

const FREQUENCIES = ["Daily", "Every 2 days", "Weekly"];

export function ChannelCard({ channel }: { channel: Channel }) {
  const Icon = PLATFORM_ICON[channel.platform];
  const [niche, setNiche] = useState(channel.niche ?? "");
  const [frequency, setFrequency] = useState(channel.postingFrequency ?? FREQUENCIES[0]);

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="size-5 text-text" aria-hidden />
          <div>
            <p className="text-sm font-medium text-text">{PLATFORM_LABEL[channel.platform]}</p>
            {channel.accountHandle && <p className="text-xs text-muted">{channel.accountHandle}</p>}
          </div>
        </div>
        <StatusBadge status={channel.status} />
      </div>

      <div className="mt-4">
        {channel.status === "disconnected" && (
          <Button variant="secondary" size="sm" onClick={() => connectChannel(channel.id)}>
            Connect
          </Button>
        )}
        {channel.status === "connecting" && (
          <Button variant="secondary" size="sm" disabled loading>
            Connecting
          </Button>
        )}
        {channel.status === "connected" && (
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm text-text">
              <input
                type="checkbox"
                checked={channel.autopilotEnabled}
                onChange={(e) => setAutopilot(channel.id, e.target.checked, niche, frequency)}
                className="size-4 rounded border-border-input accent-accent"
              />
              Autopilot on
            </label>
            {channel.autopilotEnabled && (
              <div className="space-y-2">
                <input
                  value={niche}
                  onChange={(e) => {
                    setNiche(e.target.value);
                    setAutopilot(channel.id, true, e.target.value, frequency);
                  }}
                  placeholder="Niche, e.g. personal finance"
                  className="w-full rounded-md border border-border-input bg-surface px-2 py-1.5 text-sm text-text placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
                <select
                  value={frequency}
                  onChange={(e) => {
                    setFrequency(e.target.value);
                    setAutopilot(channel.id, true, niche, e.target.value);
                  }}
                  className="w-full rounded-md border border-border-input bg-surface px-2 py-1.5 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            )}
            <button
              type="button"
              onClick={() => disconnectChannel(channel.id)}
              className="text-xs text-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}

function StatusBadge({ status }: { status: Channel["status"] }) {
  if (status === "connected") return <Badge variant="success">Connected</Badge>;
  if (status === "connecting") return <Badge><Loader2 className="size-3 animate-spin" aria-hidden /> Connecting</Badge>;
  if (status === "expired") return <Badge variant="warning">Token expired</Badge>;
  if (status === "error") return <Badge variant="danger">Error</Badge>;
  return <Badge>Not connected</Badge>;
}
