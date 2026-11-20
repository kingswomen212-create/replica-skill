"use client";

import { useSyncExternalStore } from "react";
import { getProviderKeys, subscribeProviderKeys } from "./provider-keys-client";

export function useProviderKeys() {
  return useSyncExternalStore(
    subscribeProviderKeys,
    getProviderKeys,
    () => []
  );
}
