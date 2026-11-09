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
  finalVideoUrl?: string;
  errorMessage?: string;
  createdAt: string;
  currentStep?: GenerationStep;
}

export type GenerationStep =
  | "writing_script"
  | "generating_visuals"
  | "generating_voiceover"
  | "syncing_captions"
  | "scoring_music"
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
