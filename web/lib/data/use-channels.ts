"use client";

import { useSyncExternalStore } from "react";
import { getChannels, getRuns, subscribeChannels } from "./channels-client";

export function useChannels() {
  return useSyncExternalStore(
    subscribeChannels,
    getChannels,
    () => []
  );
}

export function useAutopilotRuns() {
  return useSyncExternalStore(
    subscribeChannels,
    getRuns,
    () => []
  );
}
