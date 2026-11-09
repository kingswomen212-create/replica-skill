import type { Plan, Template, User } from "./types";

export const plans: Plan[] = [
  { id: "plan_creator", name: "Creator", priceMonthly: 29, creditsPerMonth: 3000, autopilotChannelLimit: 1 },
  { id: "plan_pro", name: "Pro", priceMonthly: 59, creditsPerMonth: 6500, autopilotChannelLimit: 3 },
  { id: "plan_studio", name: "Studio", priceMonthly: 109, creditsPerMonth: 14000, autopilotChannelLimit: 6 },
];

export const templates: Template[] = [
  { type: "faceless", title: "Faceless short", description: "Idea to a finished short in minutes.", minPlan: "Creator" },
  { type: "avatar", title: "Avatar / UGC ad", description: "A talking-head ad from one photo.", minPlan: "Creator" },
  { type: "music_video", title: "Music video", description: "Visuals synced to any track's beat.", minPlan: "Creator" },
  { type: "long_form", title: "Long-form", description: "Multi-scene narration, up to 20 minutes.", minPlan: "Pro" },
  { type: "skeleton", title: "Skeleton short", description: "Anatomy shorts that explain themselves.", minPlan: "Pro" },
  { type: "character", title: "Talking object", description: "A mascot or product that talks.", minPlan: "Pro" },
  { type: "clip", title: "AI video clip", description: "Text, image or first/last frame to video.", minPlan: "Studio" },
];

export const currentUser: User = {
  id: "user_demo",
  email: "demo@example.com",
  planId: "plan_pro",
  creditsRemaining: 1840,
};

export const voices = [
  { id: "voice_01", name: "Dana", languageCode: "en", trait: "Warm" },
  { id: "voice_02", name: "Marcus", languageCode: "en", trait: "Deep" },
  { id: "voice_03", name: "Yuki", languageCode: "ja", trait: "Soft" },
  { id: "voice_04", name: "Lucia", languageCode: "es", trait: "Energetic" },
];

export const styles = ["Cinematic", "Anime", "Realistic", "3D cartoon", "Flat explainer"];

export function planFor(planId: string): Plan {
  return plans.find((p) => p.id === planId) ?? plans[0];
}

export function planRank(name: string): number {
  return plans.findIndex((p) => p.name === name);
}
