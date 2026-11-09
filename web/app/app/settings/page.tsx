"use client";

import { useState } from "react";
import { KeyRound, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProviderKeys } from "@/lib/data/use-provider-keys";
import { addProviderKey, removeProviderKey } from "@/lib/data/provider-keys-client";
import type { ProviderType } from "@/lib/data/types";

const PROVIDER_TYPES: { type: ProviderType; label: string; placeholderName: string; example: string }[] = [
  { type: "llm", label: "Script (LLM)", placeholderName: "OpenAI", example: "e.g. your own OpenAI or Anthropic key" },
  { type: "tts", label: "Voiceover (TTS)", placeholderName: "ElevenLabs", example: "e.g. your own ElevenLabs key" },
  { type: "image", label: "Visuals (image/video gen)", placeholderName: "fal.ai", example: "e.g. your own fal.ai or Replicate key" },
];

export default function SettingsPage() {
  const keys = useProviderKeys();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-lg font-semibold text-text">Settings</h1>

      <section>
        <h2 className="flex items-center gap-2 text-sm font-medium text-text">
          <KeyRound className="size-4 text-accent" aria-hidden /> Your own AI provider keys
        </h2>
        <p className="mt-1 text-sm text-muted">
          Bring your own key for any step and it&apos;s used instead of the shared default &mdash;
          usually cheaper, and never a vendor lock-in.
        </p>
        <p className="mt-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
          Demo only: keys entered here live in this browser tab&apos;s memory, are never sent
          anywhere, and are gone on refresh. Don&apos;t paste a real secret — a real key needs
          server-side storage and encryption (replica-backend&apos;s provider_keys table), not a
          client-side form like this one.
        </p>
        <div className="mt-3 space-y-2">
          {PROVIDER_TYPES.map((p) => {
            const saved = keys.find((k) => k.providerType === p.type);
            return (
              <ProviderKeyRow key={p.type} config={p} saved={saved} />
            );
          })}
        </div>
      </section>
    </div>
  );
}

function ProviderKeyRow({
  config,
  saved,
}: {
  config: { type: ProviderType; label: string; placeholderName: string; example: string };
  saved?: { id: string; providerName: string; maskedKey: string };
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(saved?.providerName ?? config.placeholderName);
  const [value, setValue] = useState("");

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim().length < 4) return;
    addProviderKey(config.type, name, value.trim());
    setValue("");
    setEditing(false);
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text">{config.label}</p>
          <p className="text-xs text-muted">{config.example}</p>
        </div>
        {saved ? <Badge variant="success">{saved.providerName} {saved.maskedKey}</Badge> : <Badge>Using shared default</Badge>}
      </div>

      {editing ? (
        <form onSubmit={onSave} className="mt-3 flex flex-wrap items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Provider name"
            className="w-32 rounded-md border border-border-input bg-surface px-2 py-1.5 text-sm text-text placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            type="password"
            placeholder="API key"
            autoComplete="off"
            className="min-w-0 flex-1 rounded-md border border-border-input bg-surface px-2 py-1.5 text-sm text-text placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <Button type="submit" size="sm" variant="primary">Save</Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
        </form>
      ) : (
        <div className="mt-3 flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
            {saved ? "Replace key" : "Add key"}
          </Button>
          {saved && (
            <Button size="sm" variant="ghost" onClick={() => removeProviderKey(saved.id)}>
              <Trash2 className="size-3.5" aria-hidden /> Remove
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
