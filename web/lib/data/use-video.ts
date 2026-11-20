"use client";

import { useSyncExternalStore } from "react";
import { getScenes, getVideo, subscribe } from "./fake-client";

export function useVideo(videoId: string) {
  return useSyncExternalStore(
    subscribe,
    () => getVideo(videoId),
    () => undefined
  );
}

export function useScenes(videoId: string) {
  return useSyncExternalStore(
    subscribe,
    () => getScenes(videoId),
    () => []
  );
}
