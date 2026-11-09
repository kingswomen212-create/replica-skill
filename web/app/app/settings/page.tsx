import { KeyRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PROVIDER_TYPES = [
  { type: "llm", label: "Script (LLM)", example: "e.g. your own OpenAI or Anthropic key" },
  { type: "tts", label: "Voiceover (TTS)", example: "e.g. your own ElevenLabs key" },
  { type: "image", label: "Visuals (image/video gen)", example: "e.g. your own fal.ai or Replicate key" },
];

export default function SettingsPage() {
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
        <div className="mt-3 space-y-2">
          {PROVIDER_TYPES.map((p) => (
            <Card key={p.type} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text">{p.label}</p>
                <p className="text-xs text-muted">{p.example}</p>
              </div>
              <Badge>Using shared default</Badge>
            </Card>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">
          Key storage isn&apos;t wired up yet (needs replica-backend&apos;s provider_keys table and
          app-layer encryption) &mdash; this is a shell stub.
        </p>
      </section>
    </div>
  );
}
