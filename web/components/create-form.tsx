"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImagePlus, Music as MusicIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createVideo, generateVideo } from "@/lib/data/fake-client";
import { currentUser, styles, voices } from "@/lib/data/seed";
import type { Template } from "@/lib/data/types";

export function CreateForm({ template }: { template: Template }) {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [voiceId, setVoiceId] = useState(voices[0].id);
  const [style, setStyle] = useState(styles[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsIdea = template.type !== "music_video";
  const needsPhoto = template.type === "avatar";
  const needsTrack = template.type === "music_video";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (needsIdea && idea.trim().length < 4) {
      setError("Give it a bit more to work with — a sentence is enough.");
      return;
    }
    if (currentUser.creditsRemaining <= 0) {
      setError("You're out of credits this month. Upgrade your plan to keep generating.");
      return;
    }
    setSubmitting(true);
    const video = await createVideo({
      templateType: template.type,
      ideaPrompt: idea || `${template.title} from an uploaded ${needsTrack ? "track" : "photo"}`,
      voiceId,
      style,
    });
    // Kicks off the (simulated) pipeline in the background; the scene
    // editor polls the same store via useVideo/useScenes.
    void generateVideo(video.id);
    router.push(`/app/videos/${video.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
      {needsPhoto && (
        <div>
          <label className="mb-2 block text-sm font-medium text-text" htmlFor="photo">
            Your photo
          </label>
          <div className="flex items-center gap-3">
            <div className="flex size-16 items-center justify-center rounded-md border border-dashed border-border-input bg-surface text-muted">
              <ImagePlus className="size-5" aria-hidden />
            </div>
            <input id="photo" type="file" accept="image/*" className="text-sm text-muted" />
          </div>
          <p className="mt-1 text-xs text-muted">Used only to generate your video. One clear, front-facing photo works best.</p>
        </div>
      )}

      {needsTrack && (
        <div>
          <label className="mb-2 block text-sm font-medium text-text" htmlFor="track">
            Your track
          </label>
          <div className="flex items-center gap-3">
            <div className="flex size-16 items-center justify-center rounded-md border border-dashed border-border-input bg-surface text-muted">
              <MusicIcon className="size-5" aria-hidden />
            </div>
            <input id="track" type="file" accept="audio/*" className="text-sm text-muted" />
          </div>
        </div>
      )}

      {needsIdea && (
        <div>
          <label className="mb-2 block text-sm font-medium text-text" htmlFor="idea">
            {template.type === "avatar" ? "What should they say?" : "What's the video about?"}
          </label>
          <textarea
            id="idea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            rows={4}
            placeholder="A hook, a topic, or a rough script — as little or as much as you've got."
            className="w-full rounded-md border border-border-input bg-surface px-3 py-2 text-sm text-text placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </div>
      )}

      <div>
        <span className="mb-2 block text-sm font-medium text-text">Voice</span>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Voice">
          {voices.map((v) => (
            <button
              key={v.id}
              type="button"
              role="radio"
              aria-checked={voiceId === v.id}
              onClick={() => setVoiceId(v.id)}
              className={`rounded-pill border px-3 py-1.5 text-sm transition-colors ${
                voiceId === v.id ? "border-accent bg-accent/10 text-accent" : "border-border bg-surface text-muted hover:text-text"
              }`}
            >
              {v.name} <span className="text-xs opacity-70">· {v.trait}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium text-text">Style</span>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Style">
          {styles.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={style === s}
              onClick={() => setStyle(s)}
              className={`rounded-pill border px-3 py-1.5 text-sm transition-colors ${
                style === s ? "border-accent bg-accent/10 text-accent" : "border-border bg-surface text-muted hover:text-text"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <Card className="border-danger/40 bg-danger/10">
          <p role="alert" className="text-sm text-danger">{error}</p>
        </Card>
      )}

      <Button type="submit" variant="primary" size="lg" loading={submitting} disabled={submitting}>
        Generate
      </Button>
    </form>
  );
}
