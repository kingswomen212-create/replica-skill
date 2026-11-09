"use client";

import { useState } from "react";
import { Check, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SceneCard } from "@/components/ui/scene-card";
import { Toast } from "@/components/ui/toast";
import { useScenes, useVideo } from "@/lib/data/use-video";
import { exportVideo, regenerateScene, STEP_LABEL, STEP_ORDER } from "@/lib/data/fake-client";
import type { GenerationStep } from "@/lib/data/types";

export function VideoWorkspace({ videoId }: { videoId: string }) {
  const video = useVideo(videoId);
  const scenes = useScenes(videoId);
  const [exporting, setExporting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  if (!video) {
    return <p className="text-sm text-muted">Couldn&apos;t find that video. It may have been deleted.</p>;
  }

  async function onExport() {
    setExporting(true);
    const { downloadUrl } = await exportVideo(videoId);
    setDownloadUrl(downloadUrl);
    setExporting(false);
  }

  const allReady = scenes.length > 0 && scenes.every((s) => s.status === "ready");

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-text">{video.title}</h1>
        <p className="mt-1 text-sm capitalize text-muted">{video.templateType.replace("_", " ")} &middot; {video.style}</p>
      </div>

      {video.status === "generating" && (
        <GenerationStepper currentStep={video.currentStep} />
      )}

      {video.status === "failed" && video.errorMessage && (
        <Toast kind="error" title="A scene needs attention" description={video.errorMessage} />
      )}

      {scenes.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-medium text-muted">Scenes</h2>
          <div className="space-y-2" aria-live="polite">
            {scenes.map((scene, i) => (
              <SceneCard
                key={scene.id}
                index={i}
                status={scene.status}
                scriptText={scene.scriptText}
                onRegenerate={() => regenerateScene(videoId, scene.id)}
              />
            ))}
          </div>
        </div>
      )}

      {(video.status === "ready" || video.status === "published") && (
        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={onExport} loading={exporting} disabled={exporting || !allReady}>
            <Download className="size-4" aria-hidden /> Download in 4K
          </Button>
          {!allReady && (
            <p className="text-xs text-muted">Regenerate every failed scene before exporting.</p>
          )}
        </div>
      )}

      {downloadUrl && (
        <Toast kind="success" title="Video published" description={`Ready at ${downloadUrl} (simulated — no file is actually written in this build pass).`} />
      )}
    </div>
  );
}

function GenerationStepper({ currentStep }: { currentStep?: GenerationStep }) {
  const currentIndex = currentStep ? STEP_ORDER.indexOf(currentStep) : 0;
  return (
    <div role="status" aria-live="polite" className="rounded-lg border border-border bg-surface p-4">
      <ol className="space-y-2">
        {STEP_ORDER.filter((s) => s !== "done").map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <li key={step} className="flex items-center gap-2 text-sm">
              {done ? (
                <Check className="size-4 text-success" aria-hidden />
              ) : active ? (
                <Loader2 className="size-4 animate-spin text-accent" aria-hidden />
              ) : (
                <span className="size-4 rounded-full border border-border" aria-hidden />
              )}
              <span className={done ? "text-muted line-through" : active ? "text-text" : "text-muted"}>
                {STEP_LABEL[step]}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
