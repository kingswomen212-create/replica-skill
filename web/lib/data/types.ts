// Shapes mirror replica/schema.sql so a real data layer (replica-backend)
// can swap in later without changing screen code.

export type TemplateType =
  | "faceless"
  | "long_form"
  | "avatar"
  | "music_video"
  | "skeleton"
  | "character"
  | "clip";

export type VideoStatus = "draft" | "generating" | "ready" | "published" | "failed";
export type SceneStatus = "pending" | "generating" | "ready" | "failed";

export interface Scene {
  id: string;
  videoId: string;
  orderIndex: number;
  scriptText: string;
  visualPrompt: string;
  visualAssetUrl?: string;
  durationSeconds?: number;
  status: SceneStatus;
}

export interface Video {
  id: string;
  userId: string;
  templateType: TemplateType;
  status: VideoStatus;
  title: string;
  ideaPrompt: string;
  voiceId: string;
  languageCode: string;
  style: string;
  resolution: string;
  sourcePhotoUrl?: string;
  finalVideoUrl?: string;
  errorMessage?: string;
  createdAt: string;
  currentStep?: GenerationStep;
}

export type GenerationStep =
  | "writing_script"
  | "analyzing_photo"
  | "generating_visuals"
  | "generating_voiceover"
  | "generating_lipsync"
  | "detecting_beat"
  | "syncing_to_beat"
  | "syncing_captions"
  | "scoring_music"
  | "generating_clip"
  | "mastering"
  | "done";

export interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  creditsPerMonth: number;
  autopilotChannelLimit: number;
}

export interface User {
  id: string;
  email: string;
  planId: string;
  creditsRemaining: number;
}

export interface Template {
  type: TemplateType;
  title: string;
  description: string;
  minPlan: string; // plan name a user needs to unlock this template
}

export type Platform = "youtube" | "tiktok" | "instagram" | "facebook" | "threads" | "x";
export type ChannelStatus = "disconnected" | "connecting" | "connected" | "expired" | "error";

export interface Channel {
  id: string;
  platform: Platform;
  status: ChannelStatus;
  accountHandle?: string;
  autopilotEnabled: boolean;
  niche?: string;
  postingFrequency?: string;
}

export type AutopilotRunStatus = "idea_picked" | "generating" | "published" | "failed";

export interface AutopilotRun {
  id: string;
  channelId: string;
  status: AutopilotRunStatus;
  videoTitle: string;
  runAt: string;
}

export type ProviderType = "llm" | "tts" | "image";

export interface ProviderKey {
  id: string;
  providerType: ProviderType;
  providerName: string;
  /** Never the real value -- last 4 characters only, for display. */
  maskedKey: string;
}
