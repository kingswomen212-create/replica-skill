// Fake BYO-provider-key store. Nothing here is persisted or sent
// anywhere: it lives in memory for this browser tab only, and only the
// last 4 characters of whatever is typed are ever kept, matching what a
// real "masked" display should show. This is a UI demo of the feature,
// not a place to paste a real secret -- a real key belongs in
// replica-backend's provider_keys table (schema.sql), encrypted at the
// application layer, never in a client-side demo store like this one.

import { nanoid } from "nanoid";
import type { ProviderKey, ProviderType } from "./types";

let keys: ProviderKey[] = [];

type Listener = () => void;
const listeners = new Set<Listener>();
function notify() {
  Array.from(listeners).forEach((l) => l());
}
export function subscribeProviderKeys(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getProviderKeys(): ProviderKey[] {
  return keys;
}

export function addProviderKey(providerType: ProviderType, providerName: string, rawValue: string) {
  const masked = rawValue.length > 4 ? `••••${rawValue.slice(-4)}` : "••••";
  keys = [
    ...keys.filter((k) => k.providerType !== providerType),
    { id: nanoid(8), providerType, providerName, maskedKey: masked },
  ];
  notify();
}

export function removeProviderKey(id: string) {
  keys = keys.filter((k) => k.id !== id);
  notify();
}
