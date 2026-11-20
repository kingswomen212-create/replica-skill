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
//
// Each template has its own step sequence and scene count (template-
// config.ts), not one generic pipeline with a different label on top:
// avatar analyzes a photo and lip-syncs instead of painting visuals,
// music-video detects a beat, long-form runs nine scenes instead of four.

import { nanoid } from "nanoid";
import type { Scene, TemplateType, Video } from "./types";
import { currentUser } from "./seed";
import { STEP_LABEL, TEMPLATE_CONFIG } from "./template-config";

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

export { STEP_LABEL };
export function stepsFor(templateType: TemplateType) {
  return TEMPLATE_CONFIG[templateType].steps;
}

export interface CreateVideoInput {
  templateType: TemplateType;
  ideaPrompt: string;
  voiceId: string;
  style: string;
  languageCode?: string;
  sourcePhotoUrl?: string;
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
    sourcePhotoUrl: input.sourcePhotoUrl,
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

// A stable reference, not a fresh [] on every call: useSyncExternalStore
// (see use-video.ts) detects a change by comparing the snapshot it got
// last time against this one, by reference. Returning a new array
// literal for a missing id would look like a change on every single
// render and infinite-loop (React throws "Maximum update depth
// exceeded" once it notices) -- found by an e2e test visiting a bad
// video id, see replica/bugs.md BUG-003.
const EMPTY_SCENES: Scene[] = [];

export function getScenes(videoId: string): Scene[] {
  return store.scenes.get(videoId) ?? EMPTY_SCENES;
}

/** Simulates the real generate-video job for this video's template: its
 * own step sequence, its own scene count and script beats, from
 * template-config.ts. */
export async function generateVideo(videoId: string): Promise<void> {
  const video = store.videos.get(videoId);
  if (!video) throw new Error("video_not_found");
  const config = TEMPLATE_CONFIG[video.templateType];
  const [firstStep, ...restSteps] = config.steps;

  setVideo(videoId, { status: "generating", currentStep: firstStep });
  await wait(900);

  const scriptLines = config.sceneScripts(video.ideaPrompt);
  const sceneIds = scriptLines.map(() => nanoid(8));
  const scenes: Scene[] = scriptLines.map((line, i) => ({
    id: sceneIds[i],
    videoId,
    orderIndex: i,
    scriptText: line,
    visualPrompt: `${video.style} visual for: ${line}`,
    status: "pending",
  }));
  store.scenes.set(videoId, scenes);
  notify();

  // Exactly one per-scene step per template -- the step where scenes get
  // their content. Every other step (detecting_beat, syncing_to_beat,
  // syncing_captions, ...) is a flat delay, not a second scene pass.
  // syncing_to_beat used to be listed here too, which made music_video
  // run the whole scene loop twice and left it permanently stuck
  // "failed" (the forced first-pass failure re-fired every pass with no
  // way to regenerate past it). See replica/bugs.md BUG-002.
  const visualishSteps = new Set(["generating_visuals", "generating_lipsync", "generating_clip"]);

  for (const step of restSteps.slice(0, -1)) {
    setVideo(videoId, { currentStep: step });
    if (visualishSteps.has(step)) {
      for (const sceneId of sceneIds) {
        setScene(videoId, sceneId, { status: "generating" });
        await wait(scenes.length <= 2 ? 1100 : 500);
        const scene = (store.scenes.get(videoId) ?? []).find((s) => s.id === sceneId)!;
        if (config.failingSceneIndex !== null && scene.orderIndex === config.failingSceneIndex) {
          setScene(videoId, sceneId, { status: "failed" });
        } else {
          setScene(videoId, sceneId, {
            status: "ready",
            visualAssetUrl: video.sourcePhotoUrl ?? `/seed/scene-${scene.orderIndex}.svg`,
            durationSeconds: config.sceneDurationSeconds,
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
  const video = store.videos.get(videoId);
  const scenes = store.scenes.get(videoId);
  const scene = scenes?.find((s) => s.id === sceneId);
  if (!scene || !video) throw new Error("scene_not_found");
  const config = TEMPLATE_CONFIG[video.templateType];

  setScene(videoId, sceneId, { status: "generating" });
  await wait(1200);
  setScene(videoId, sceneId, {
    status: "ready",
    visualAssetUrl: video.sourcePhotoUrl ?? `/seed/scene-${scene.orderIndex}.svg`,
    durationSeconds: config.sceneDurationSeconds,
  });

  const refreshedScenes = store.scenes.get(videoId) ?? [];
  if (video.status === "failed" && refreshedScenes.every((s) => s.status === "ready")) {
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
