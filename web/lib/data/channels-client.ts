// Fake Autopilot data layer, same shape and immutability discipline as
// fake-client.ts (see its header comment on why state is always replaced,
// never mutated, for useSyncExternalStore to pick up changes). Simulates
// connecting a channel (an OAuth redirect in the real app) and a
// scheduled autopilot cycle (architecture.md's autopilot-cycle job).

import { nanoid } from "nanoid";
import type { AutopilotRun, Channel, Platform } from "./types";

const PLATFORMS: Platform[] = ["youtube", "tiktok", "instagram", "facebook", "threads", "x"];
const HANDLES: Record<Platform, string> = {
  youtube: "@reelclone-demo",
  tiktok: "@reelclone.demo",
  instagram: "@reelclone.demo",
  facebook: "Reel Clone Demo",
  threads: "@reelclone.demo",
  x: "@reelclonedemo",
};

let channels: Channel[] = PLATFORMS.map((platform) => ({
  id: nanoid(8),
  platform,
  status: "disconnected",
  autopilotEnabled: false,
}));

let runs: AutopilotRun[] = [];

type Listener = () => void;
const listeners = new Set<Listener>();
function notify() {
  Array.from(listeners).forEach((l) => l());
}
export function subscribeChannels(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getChannels(): Channel[] {
  return channels;
}

export function getRuns(): AutopilotRun[] {
  return runs;
}

function patchChannel(id: string, patch: Partial<Channel>) {
  channels = channels.map((c) => (c.id === id ? { ...c, ...patch } : c));
  notify();
}

/** Simulates the OAuth redirect + callback round trip. */
export async function connectChannel(id: string): Promise<void> {
  const channel = channels.find((c) => c.id === id);
  if (!channel) return;
  patchChannel(id, { status: "connecting" });
  await wait(1000);
  patchChannel(id, { status: "connected", accountHandle: HANDLES[channel.platform] });
}

export function disconnectChannel(id: string) {
  patchChannel(id, {
    status: "disconnected",
    accountHandle: undefined,
    autopilotEnabled: false,
    niche: undefined,
    postingFrequency: undefined,
  });
}

export function setAutopilot(id: string, enabled: boolean, niche?: string, postingFrequency?: string) {
  patchChannel(id, {
    autopilotEnabled: enabled,
    ...(niche !== undefined ? { niche } : {}),
    ...(postingFrequency !== undefined ? { postingFrequency } : {}),
  });
  if (enabled) {
    seedRunsFor(id);
  }
}

const SAMPLE_TITLES = [
  "What happens if you skip warm-ups forever",
  "The pricing mistake most new sellers make",
  "Why your first draft is always too long",
  "A two-minute fix for a cluttered desk",
];

function seedRunsFor(channelId: string) {
  if (runs.some((r) => r.channelId === channelId)) return;
  const now = Date.now();
  runs = [
    ...runs,
    {
      id: nanoid(8),
      channelId,
      status: "published",
      videoTitle: SAMPLE_TITLES[0],
      runAt: new Date(now - 1000 * 60 * 60 * 20).toISOString(),
    },
    {
      id: nanoid(8),
      channelId,
      status: "published",
      videoTitle: SAMPLE_TITLES[1],
      runAt: new Date(now - 1000 * 60 * 60 * 44).toISOString(),
    },
  ];
  notify();
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
