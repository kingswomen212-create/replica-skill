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
| S01 home | 2026-11-09 | done | | hero, template grid, differentiator callouts, CTA |
| S02 features | 2026-11-09 | done | | 6 feature cards, pulls real counts from seed.ts |
| S03 how it works | 2026-11-09 | done | | 3-step explainer |
| S04 pricing | 2026-11-09 | done | | 3 plan cards from seed.ts plans |
| S05 FAQ | 2026-11-09 | done | | accordion, 7 original Q&As |
| S06 tools/niche landing pages | 2026-11-09 | not started | everything | recon marked this an SEO-funnel, marketing-site concern, lowest priority of the six |
| S07 sign up | 2026-11-09 | partial | real auth | form + Google button render and validate; submitting drops you straight into `/app` as the seeded demo user |
| S08 sign in | 2026-11-09 | partial | real auth | same as S07 |

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

## Widening pass: marketing site + sign up/sign in

Third pass, same session: built the five marketing screens recon scoped
as core (home, features, pricing, how-it-works, FAQ — `/tools`'s niche
landing pages stay out of scope, recon flagged them as an SEO-funnel
concern rather than core app) under a `(marketing)` route group with its
own nav/footer, distinct from the in-app shell. All copy is original —
nothing from aituber.app's marketing pages was read or adapted, per
replica-build's clean-room rule. Pricing and the template grid pull their
numbers from `lib/data/seed.ts` rather than being hand-typed twice.

Added S07/S08 (sign up / sign in): real client-side validation (required
fields, min password length), but no real auth — submitting either form
takes you straight to `/app` as the seeded demo user, same as the rest of
this pass's fake data layer.

One build error worth a note: `lucide-react` has no `Chrome` icon export
in the installed version, used for a "Continue with Google" button.
Replaced it with the generic `Globe` icon rather than hunting for a
brand-shaped substitute — a browser-logo icon next to a Google button
would have been borrowing Google's visual association anyway, which the
skill's clean-room rule (no logos not our own) argues against regardless
of whether lucide shipped one.

Verified with Playwright against the production build: visited all 7 new
routes, expanded an FAQ item, and ran signup -> /app end to end. Zero
console errors. Screenshots: `S01-home-new.png` (+ mobile),
`S02-features.png`, `S03-howitworks.png`, `S04-pricing.png`,
`S05-faq.png` (+ expanded), `S07-signup.png`, `S08-signin.png`.

## Parity

`python3 replica-diff/parity.py replica/features.csv` → 39.4/100, 2 of 10
must-haves fully done. Correctly still says "not shippable yet" — the
remaining must-haves are all about the real AI pipeline and billing
enforcement, which no amount of frontend widening substitutes for.

## Next

Real backend work is blocked on credentials the user hasn't provided yet
(an OpenAI key was attempted and rejected by OpenAI as invalid; see chat
history). Until that's unblocked, remaining frontend work is S06's niche
landing pages (low value, explicitly out of scope per recon), S19/S20
Autopilot's UI made interactive against local state, or S21/S22 made to
actually persist choices client-side. Once real credentials land:
`/replica-backend` swaps `lib/data/fake-client.ts` for the real Supabase
tables + Trigger.dev jobs from architecture.md (same function signatures,
so no screen changes), wires a real LLM/TTS/image provider behind the BYO
provider-key settings page, and adds Stripe + credit enforcement. Then
`/replica-test` once the data layer is real.
