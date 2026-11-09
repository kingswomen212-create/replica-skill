# Build log

Scope for this pass: shell (routing for the full screen inventory) +
vertical slice (faceless-shorts core loop, end to end, against a fake
data layer). Per architecture.md's build order, must-haves beyond the
slice (real AI providers, billing enforcement, scene music/captions,
publishing, Autopilot) are next, now that the slice has proven the UI/data
shape. All code is clean-room (see replica-build/SKILL.md rules) — no
HTML/CSS/JS/assets were read or copied from aituber.app; `web/` is built
from recon.md, architecture.md and design/ only.

| screen | date | status | missing | notes |
| --- | --- | --- | --- | --- |
| S09 dashboard (template picker) | 2026-11-09 | done | plan-gating is static (seed user is always "Pro") | |
| S10 faceless creator | 2026-11-09 | done | | full idea form, voice/style pickers |
| S11 long-form creator | 2026-11-09 | partial | real AI calls | own 9-scene chapter structure and longer per-scene duration (template-config.ts) |
| S12 avatar/UGC creator | 2026-11-09 | partial | real lip-sync, likeness/consent gate | photo is used as the scene thumbnail; own analyzing_photo/generating_lipsync steps; single scene, never forced to fail |
| S13 music-video creator | 2026-11-09 | partial | real beat detection | own detecting_beat/syncing_to_beat steps, 6 beat-matched scenes |
| S14 skeleton creator | 2026-11-09 | partial | real AI calls | own anatomy-themed scene beats, same step shape as faceless |
| S15 talking-object creator | 2026-11-09 | partial | real AI calls | own mascot/product-themed scene beats |
| S16 AI clip creator | 2026-11-09 | partial | real AI calls, distinct input modes | own minimal generating_clip/mastering pipeline, single scene, never forced to fail |
| S17 scene editor / live progress | 2026-11-09 | done | real AI calls, real asset thumbnails | regenerate works; one scene fails by design on first pass to exercise the error state honestly, not just style it |
| S18 export | 2026-11-09 | partial | no file is actually produced | button, loading state and success toast all work against the fake layer |
| S19 Autopilot setup | 2026-11-09 | stub | everything | shell page only, says so on-screen; highest-risk feature per architecture.md, built last on purpose |
| S20 Autopilot dashboard | 2026-11-09 | not started | everything | folded into S19's stub for now |
| S21 billing | 2026-11-09 | partial | Stripe checkout, credit enforcement | plan cards + credit meter render from seed data; buttons are presentational |
| S22 settings (BYO provider keys) | 2026-11-09 | stub | key storage, encryption | shell page explains the feature and shows the three key types; nothing is saved |
| S01-S06 marketing site | 2026-11-09 | not started | everything | out of scope this pass; `/` is a one-screen placeholder into `/app` |
| S07/S08 sign up / sign in | 2026-11-09 | not started | everything | no auth; a single seeded demo user stands in (`lib/data/seed.ts`) |

## What was harder than expected

**State management with the fake data layer.** The first version of
`lib/data/fake-client.ts` mutated the `Video` and `Scene` objects in place
(`video.status = "generating"`, etc.) and called a `notify()` pub-sub. The
UI froze after the very first update: `useSyncExternalStore` (which
`useVideo`/`useScenes` are built on) detects a change by comparing the
snapshot it got last time against the one it gets now, by reference. A
mutated-in-place object is still the *same* reference, so React decided
nothing had changed and stopped re-rendering, even though `notify()` kept
firing. Confirmed with a Playwright run: the generation stepper rendered
once and then sat there indefinitely instead of advancing through steps.
Fixed by replacing objects immutably on every state change (`{ ...current,
...patch }`) instead of mutating them, then re-ran the same Playwright
flow end to end (create → generate → one scene fails on purpose →
regenerate → export) to confirm it actually completes, not just that it
compiles. This matters for `/replica-backend` too: the real client (e.g.
Supabase Realtime payloads) needs to hand the UI fresh objects per
update for the same reason.

**A second, separate bug** in the `Button` primitive: `asChild` (Radix
`Slot`, used for `<Button asChild><Link>...</Link></Button>`) requires
exactly one child element, but `Button` always wrapped its children in a
loading-icon-plus-`<span>` pair. `next build`'s static prerender caught it
(`Slot failed to slot onto its children`) on the one page that used
`asChild` (`/`). Fixed by giving `asChild` its own render path that skips
the wrapper.

## Verified, not just built

Ran the full faceless flow with Playwright against the production build
(`next build && next start`), not the dev server: create → watch the
6-step progress stepper advance → see scene 4 fail → retry it →
confirm Download in 4K enables only once every scene is ready → export
→ success toast. Zero console errors. Screenshots in
`replica/clone-screens/` (S09, S10 at 1440px and 390px, S17 mid-generation
and after the forced failure, S18 after export, plus the three stub
screens for the record).

## Widening pass: per-template differentiation

Second pass, same session: the other six templates no longer share
faceless's exact pipeline with a different label on top. Each has its own
step sequence and scene shape in `lib/data/template-config.ts`:

- **avatar**: `analyzing_photo` → `writing_script` → `generating_lipsync`
  → `syncing_captions` → `mastering`. One scene, not four — it's a single
  continuous talking-head clip. The uploaded photo is wired through for
  real (an actual `URL.createObjectURL` preview, passed to `createVideo`
  as `sourcePhotoUrl`, shown as the scene's thumbnail) rather than just
  accepted and ignored. Never forced to fail, since failing the only
  scene reads as broken rather than a realistic demo.
- **music_video**: `detecting_beat` → `generating_visuals` →
  `syncing_to_beat` → `mastering`, 6 beat-matched scenes instead of 4.
- **long_form**: same step shape as faceless but 9 chapter-structured
  scenes at a longer per-scene duration (45s vs 5s).
- **skeleton** / **character**: same step shape as faceless, with their
  own (generic, original) scene beats instead of faceless's.
- **clip**: minimal `generating_clip` → `mastering`, one scene.

Verified with Playwright against the production build: uploaded a real
PNG to the avatar form and confirmed it renders as the scene's thumbnail
(`img[alt="Scene 1 preview"]` present), confirmed the music-video stepper
shows "Detecting the track's beat" and produces exactly 6 scenes, and
confirmed long-form produces exactly 9. Zero console errors.
Screenshots: `S11-long-form.png`, `S12-avatar-ready.png`,
`S13-music-video.png`.

## Parity

`python3 replica-diff/parity.py replica/features.csv` → 36.2/100, 2 of 10
must-haves fully done (scene regeneration; template selection now counts
as done since every template has real, distinct behavior even though the
AI calls themselves are still simulated). Correctly says "not shippable
yet" — accurate for this pass, not a defect.

## Next

`/replica-backend`: swap `lib/data/fake-client.ts` for the real Supabase
tables + Trigger.dev jobs from architecture.md (same function signatures,
so no screen changes), wire a real LLM/TTS/image provider behind the BYO
provider-key settings page, and add Stripe + credit enforcement. Then
`/replica-test` once the data layer is real.
