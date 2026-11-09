// Fake data layer. Same function signatures the architecture.md API table
// describes (createVideo, generateVideo, getVideo, regenerateScene,
// exportVideo) so /replica-backend can swap in the real Supabase/Trigger.dev
// implementation without any screen changing. Everything here lives in a
// module-level store and simulates the pipeline's timing with setTimeout
// instead of a real job queue.
//
// State is always replaced, never mutated in place: useVideo/useScenes
// read it through useSyncExternalStore, which detects a change by
// reference equality. Mutating a Video or Scene object's fields directly
// would leave the old object reference in the Map and the UI would never
// re-render past its first paint.

import { nanoid } from "nanoid";
import type { GenerationStep, Scene, TemplateType, Video } from "./types";
import { currentUser } from "./seed";

interface Store {
  videos: Map<string, Video>;
  scenes: Map<string, Scene[]>;
}

const store: Store = { videos: new Map(), scenes: new Map() };

type Listener = () => void;
const listeners = new Set<Listener>();
function notify() {
  Array.from(listeners).forEach((l) => l());
}
export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setVideo(id: string, patch: Partial<Video>) {
  const current = store.videos.get(id);
  if (!current) return;
  store.videos.set(id, { ...current, ...patch });
  notify();
}

function setScene(videoId: string, sceneId: string, patch: Partial<Scene>) {
  const scenes = store.scenes.get(videoId) ?? [];
  store.scenes.set(
    videoId,
    scenes.map((s) => (s.id === sceneId ? { ...s, ...patch } : s))
  );
  notify();
}

const STEP_ORDER: GenerationStep[] = [
  "writing_script",
  "generating_visuals",
  "generating_voiceover",
  "syncing_captions",
  "scoring_music",
  "mastering",
  "done",
];

const STEP_LABEL: Record<GenerationStep, string> = {
  writing_script: "Writing a viral-ready script",
  generating_visuals: "Painting AI visuals per scene",
  generating_voiceover: "Generating your voiceover",
  syncing_captions: "Syncing captions to every word",
  scoring_music: "Scoring with background music",
  mastering: "Mastering the final video",
  done: "Done",
};
export { STEP_LABEL, STEP_ORDER };

export interface CreateVideoInput {
  templateType: TemplateType;
  ideaPrompt: string;
  voiceId: string;
  style: string;
  languageCode?: string;
}

export async function createVideo(input: CreateVideoInput): Promise<Video> {
  const video: Video = {
    id: nanoid(10),
    userId: currentUser.id,
    templateType: input.templateType,
    status: "draft",
    title: input.ideaPrompt.slice(0, 60) || "Untitled video",
    ideaPrompt: input.ideaPrompt,
    voiceId: input.voiceId,
    languageCode: input.languageCode ?? "en",
    style: input.style,
    resolution: "1080x1920",
    createdAt: new Date().toISOString(),
  };
  store.videos.set(video.id, video);
  store.scenes.set(video.id, []);
  notify();
  return video;
}

export function getVideo(id: string): Video | undefined {
  return store.videos.get(id);
}

export function getScenes(videoId: string): Scene[] {
  return store.scenes.get(videoId) ?? [];
}

const SCENE_SCRIPTS = [
  "Open on the hook: the one claim that stops the scroll.",
  "Set up the problem most people get wrong.",
  "Reveal the twist the idea turns on.",
  "Land the payoff and the call to action.",
];

/** Simulates the real generate-video job: writes a script, then generates
 * each scene's visuals/voice/captions, moving the video through the same
 * steps the marketing site's own progress animation shows. */
export async function generateVideo(videoId: string): Promise<void> {
  const video = store.videos.get(videoId);
  if (!video) throw new Error("video_not_found");

  setVideo(videoId, { status: "generating", currentStep: "writing_script" });
  await wait(900);

  const sceneIds = SCENE_SCRIPTS.map(() => nanoid(8));
  const scenes: Scene[] = SCENE_SCRIPTS.map((line, i) => ({
    id: sceneIds[i],
    videoId,
    orderIndex: i,
    scriptText: line,
    visualPrompt: `${video.style} visual for: ${line}`,
    status: "pending",
  }));
  store.scenes.set(videoId, scenes);
  notify();

  for (const step of STEP_ORDER.slice(1, -1)) {
    setVideo(videoId, { currentStep: step });
    if (step === "generating_visuals") {
      for (const sceneId of sceneIds) {
        setScene(videoId, sceneId, { status: "generating" });
        await wait(500);
        const scene = (store.scenes.get(videoId) ?? []).find((s) => s.id === sceneId)!;
        // One scene occasionally "fails" so the error state is real to
        // test, not just styled -- scene 4 (index 3) fails on first pass.
        if (scene.orderIndex === 3) {
          setScene(videoId, sceneId, { status: "failed" });
        } else {
          setScene(videoId, sceneId, {
            status: "ready",
            visualAssetUrl: `/seed/scene-${scene.orderIndex}.svg`,
            durationSeconds: 5,
          });
        }
      }
    } else {
      await wait(500);
    }
  }

  const finalScenes = store.scenes.get(videoId) ?? [];
  const anyFailed = finalScenes.some((s) => s.status === "failed");
  setVideo(videoId, {
    status: anyFailed ? "failed" : "ready",
    currentStep: "done",
    errorMessage: anyFailed
      ? "One scene couldn't be generated. Regenerate it before exporting."
      : undefined,
  });
}

export async function regenerateScene(videoId: string, sceneId: string): Promise<void> {
  const scenes = store.scenes.get(videoId);
  const scene = scenes?.find((s) => s.id === sceneId);
  if (!scene) throw new Error("scene_not_found");

  setScene(videoId, sceneId, { status: "generating" });
  await wait(1200);
  setScene(videoId, sceneId, {
    status: "ready",
    visualAssetUrl: `/seed/scene-${scene.orderIndex}.svg`,
    durationSeconds: 5,
  });

  const video = store.videos.get(videoId);
  const refreshedScenes = store.scenes.get(videoId) ?? [];
  if (video && video.status === "failed" && refreshedScenes.every((s) => s.status === "ready")) {
    setVideo(videoId, { status: "ready", errorMessage: undefined });
  }
}

export async function exportVideo(videoId: string): Promise<{ downloadUrl: string }> {
  const video = store.videos.get(videoId);
  if (!video) throw new Error("video_not_found");
  if (video.status !== "ready") throw new Error("video_not_ready");
  await wait(800);
  const downloadUrl = `/exports/${videoId}.mp4`;
  setVideo(videoId, { status: "published", finalVideoUrl: downloadUrl });
  return { downloadUrl };
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
