// Per-template pipeline shape: which steps it moves through, how many
// scenes it generates, and the (generic, non-infringing) placeholder
// script beats used to fill them in. This is what makes the six other
// templates genuinely different from faceless, rather than all sharing
// one generic pipeline with a different label on top.

import type { GenerationStep, TemplateType } from "./types";

export interface TemplateConfig {
  steps: GenerationStep[];
  sceneScripts: (idea: string) => string[];
  /** Scene index that fails on the first generation pass, to exercise the
   * real error/retry UI rather than only ever showing the happy path.
   * null for single-scene templates, where failing the only scene would
   * make the demo feel broken rather than realistic. */
  failingSceneIndex: number | null;
  sceneDurationSeconds: number;
}

const beats = (...lines: string[]) => () => lines;

export const TEMPLATE_CONFIG: Record<TemplateType, TemplateConfig> = {
  faceless: {
    steps: [
      "writing_script",
      "generating_visuals",
      "generating_voiceover",
      "syncing_captions",
      "scoring_music",
      "mastering",
    ],
    sceneScripts: beats(
      "Open on the hook: the one claim that stops the scroll.",
      "Set up the problem most people get wrong.",
      "Reveal the twist the idea turns on.",
      "Land the payoff and the call to action."
    ),
    failingSceneIndex: 3,
    sceneDurationSeconds: 5,
  },

  long_form: {
    steps: [
      "writing_script",
      "generating_visuals",
      "generating_voiceover",
      "syncing_captions",
      "scoring_music",
      "mastering",
    ],
    sceneScripts: beats(
      "Cold open: the question this video answers.",
      "Context: why it matters right now.",
      "Chapter 1: the first piece of the idea.",
      "Chapter 2: where most explanations stop short.",
      "Chapter 3: the part that's actually surprising.",
      "A worked example, start to finish.",
      "The common mistake, and how to avoid it.",
      "Recap and the one thing to remember.",
      "Call to action and what to watch next."
    ),
    failingSceneIndex: 6,
    sceneDurationSeconds: 45,
  },

  avatar: {
    steps: ["analyzing_photo", "writing_script", "generating_lipsync", "syncing_captions", "mastering"],
    sceneScripts: (idea) => [idea || "A short, direct pitch straight to camera."],
    failingSceneIndex: null,
    sceneDurationSeconds: 20,
  },

  music_video: {
    steps: ["detecting_beat", "generating_visuals", "syncing_to_beat", "mastering"],
    sceneScripts: beats(
      "Intro — visuals build in on the first bar.",
      "Verse 1 — a steady, narrower frame.",
      "Pre-chorus — motion starts to build.",
      "Chorus / drop — the widest, busiest visual.",
      "Verse 2 — back to the narrower frame.",
      "Outro — visuals settle as the track fades."
    ),
    failingSceneIndex: 4,
    sceneDurationSeconds: 8,
  },

  skeleton: {
    steps: [
      "writing_script",
      "generating_visuals",
      "generating_voiceover",
      "syncing_captions",
      "scoring_music",
      "mastering",
    ],
    sceneScripts: beats(
      "Open on the “what happens if…” question.",
      "Show the system under normal conditions.",
      "Push it to the extreme the question asks about.",
      "Land the explanation in one plain sentence."
    ),
    failingSceneIndex: 2,
    sceneDurationSeconds: 6,
  },

  character: {
    steps: [
      "writing_script",
      "generating_visuals",
      "generating_voiceover",
      "syncing_captions",
      "scoring_music",
      "mastering",
    ],
    sceneScripts: beats(
      "Introduce the character and its one personality trait.",
      "Show it running into the relatable problem.",
      "The character solves it in its own voice.",
      "End on the character's signature line."
    ),
    failingSceneIndex: 1,
    sceneDurationSeconds: 6,
  },

  clip: {
    steps: ["generating_clip", "mastering"],
    sceneScripts: (idea) => [idea || "A single generated clip from the given prompt."],
    failingSceneIndex: null,
    sceneDurationSeconds: 4,
  },
};

export const STEP_LABEL: Record<GenerationStep, string> = {
  writing_script: "Writing a viral-ready script",
  analyzing_photo: "Analyzing your photo",
  generating_visuals: "Painting AI visuals per scene",
  generating_voiceover: "Generating your voiceover",
  generating_lipsync: "Syncing lip movement to the voiceover",
  detecting_beat: "Detecting the track's beat",
  syncing_to_beat: "Syncing visuals to the beat",
  syncing_captions: "Syncing captions to every word",
  scoring_music: "Scoring with background music",
  generating_clip: "Generating your clip",
  mastering: "Mastering the final video",
  done: "Done",
};
