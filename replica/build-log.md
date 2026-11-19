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
| S19 Autopilot setup | 2026-11-09 | partial | real OAuth, real scheduler | connect/disconnect, autopilot toggle, niche + cadence are interactive against local state (channels-client.ts) |
| S20 Autopilot dashboard | 2026-11-09 | partial | real run history | folded into S19; a run history seeds in as soon as autopilot is turned on for a channel |
| S21 billing | 2026-11-09 | partial | Stripe checkout, credit enforcement | plan cards + credit meter render from seed data; buttons are presentational |
| S22 settings (BYO provider keys) | 2026-11-09 | partial | real storage, encryption, real provider calls | add/replace/remove a key is interactive against local state (provider-keys-client.ts), masked to last 4 chars, explicit on-screen warning that it's not persisted or sent anywhere |
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

## Widening pass: Autopilot and settings made interactive

Fourth pass, same session: both remaining stub screens now hold real
client-side state instead of static placeholders.

- **Autopilot** (`lib/data/channels-client.ts`, same immutable-update
  discipline as `fake-client.ts`): Connect simulates the OAuth redirect
  round trip (a `connecting` state, then `connected` with a fake account
  handle), the autopilot checkbox reveals niche + posting-cadence
  controls, and turning it on seeds a small run history so the screen
  isn't empty the moment it's useful. Disconnect tears all of that back
  down. None of it touches a real platform; the page says so on-screen.
- **Settings / BYO provider keys** (`lib/data/provider-keys-client.ts`):
  add, replace and remove a key per provider type, masked to its last 4
  characters on display. Deliberately **not** a realistic security demo:
  the page carries an explicit warning that nothing here is persisted or
  sent anywhere, because a convincing-looking key-entry form that doesn't
  actually protect what's typed into it would be worse than an honest
  stub — it could tempt someone into pasting a real secret.

Two more lucide-react gaps found the same way as the earlier `Chrome`
icon: `Youtube`, `Instagram` and `Facebook` aren't exported by the
installed version either. Replaced with generic icons (`PlaySquare`,
`Camera`, `Users`, `Hash`) rather than hunting for brand-shaped
substitutes — platform logos are exactly the kind of foreign trademark
replica-design's rules already say not to reproduce, so the gap pointed
at the right call anyway.

Verified with Playwright against the production build: connected a
channel, toggled autopilot, set a niche, confirmed the seeded run history
appears, disconnected, then added a provider key and confirmed only the
last 4 characters ever render, then removed it. Zero console errors.
Screenshots: `S19-autopilot-empty.png`, `S19-autopilot-connected.png`,
`S22-settings-key-added.png`.

## Parity

`python3 replica-diff/parity.py replica/features.csv` → 40.4/100, 2 of 10
must-haves fully done. Correctly still says "not shippable yet" — the
remaining must-haves are all about the real AI pipeline and billing
enforcement, which no amount of frontend widening substitutes for.

## replica-test pass

`replica/test-plan.md` (19 cases from F01-F05 plus navigation), 17
automated as Playwright specs under `web/e2e/`, run against the
production build (`next build && next start`) with a real axe
accessibility scan and console-error/5xx watchers on every spec.
1 case (out-of-credits) is correctly blocked rather than faked, since
credit enforcement isn't wired yet; documented in the test plan, not
skipped silently.

Found and fixed 5 real bugs (full detail, repro steps and the regression
test for each in `replica/bugs.md`), 3 of them only surfaced once the
suite actually exercised edge cases that manual spot-checks hadn't hit:

- **BUG-003** (S2): visiting a nonexistent video id crashed the whole
  page with "Maximum update depth exceeded" instead of showing the
  graceful empty state the code already had for it. `getScenes()`
  returned a fresh `[]` literal on every call for a missing id;
  `useSyncExternalStore` compares snapshots by reference, so a new array
  every render looks like a perpetual change. Same bug class as the
  mutation freeze found during replica-build, inverted.
- **BUG-004** (S2): music-video could never export. Its step sequence
  wrongly ran the per-scene generation loop twice (`generating_visuals`
  *and* `syncing_to_beat`), which re-applied the forced first-pass
  failure on every pass with no way to ever get past it.
- **BUG-005** (S3): the selected voice/style chip's text failed WCAG AA
  contrast (3.43:1 against a 4.5:1 floor), caught by an axe scan the
  test suite runs on every creator screen. tokens.json's own
  `contrast.py` check doesn't cover a translucent `accent/10` background
  paired with accent-colored text, so this slipped through design.

Also hit three test-authoring mistakes worth recording since they ate
real debugging time chasing what looked like app bugs: an unscoped
`getByRole("button", { name: "Generate" })` substring-matched
"**Re**generate scene N" buttons too; `getByRole("alert")` collided with
Next.js's own route-announcer element; and `Promise.all([click(), click()])`
hung for a full test timeout when the first click navigated away,
because `click()` retries its actionability check against a now-stale
element handle. None of these are in `bugs.md` (they're test bugs, not
product bugs) but they're logged in the bugs file's own section so the
false trail doesn't get walked again.

One infrastructure finding, also not a product bug: Playwright's
`webServer` auto-start wrapper around `next start` produced severe,
consistent slowdowns in this specific sandboxed environment (a pipeline
that finished in ~3-4s against a manually-started server took 15-30s+ or
timed out against the auto-started one, identical code). Switched to
starting the server manually with output redirected to a file.

Re-ran the full suite twice after all fixes: 17/17 pass both times, zero
flakiness.

## Real generation, $0 budget: the faceless template actually works now

The user has no budget for a paid AI provider (an OpenAI key was tried;
the account had no billing credit). Rather than stay simulated
indefinitely, built a genuinely free pipeline for the faceless template
specifically (`web/lib/ai/free-pipeline.ts`): script from pollinations.ai's
free text API, per-scene images from its free image API, voiceover from
the offline `espeak-ng` engine, composited into a real MP4 with ffmpeg
(Ken Burns zoom + burned-in captions). `POST /api/generate-faceless`
returns the actual video file; `components/real-faceless-generator.tsx`
replaces `CreateForm` for this one template only -- the other 6 stay on
the simulated pipeline, clearly labeled "Real — free tier" vs. not on
the dashboard.

Three real bugs found and fixed while getting this working, in order:

1. **Server-side fetch calls failed unpredictably inside Next's route
   handler** (`ENOTFOUND`, then inconsistent errors) despite identical
   code working every time as a standalone Node script. Traced to Next.js
   patching/bundling `fetch` (and even an explicit `undici` import) in a
   way that doesn't cooperate with this sandbox's HTTPS proxy. Fixed by
   shelling out to `curl` for these calls instead -- the same tool every
   other network call in this project already uses successfully.
2. **`seed=Date.now()`** overflows the free API's signed-int32 limit
   (2147483647) and gets rejected -- surfaced as a confusing 400/402
   depending on endpoint. Fixed with a bounded random seed.
3. **Captions ran off both edges of the frame.** `drawtext` never wraps
   text on its own; this wasn't caught until actually looking at a
   rendered frame, not just checking exit codes. Fixed with a real
   word-wrap function and `textfile=` (reads from a file, sidesteps
   filter-string escaping entirely) instead of an inline `text=` value.

Honest limitations of the $0 path, stated on the page itself, not buried:
the free image API's watermark can't be removed (confirmed: `nologo=true`
has no effect on the anonymous tier) and it rate-limits to 1 image per
45 seconds per IP, so a 4-scene video takes 2-4 minutes; the voice is
`espeak-ng`, robotic, and the voice/language pickers don't affect it yet;
output is 1080x1920, not 4K. All real tradeoffs of free, not bugs.

Verified twice end to end against the production build: once hitting the
API directly with curl (3.2MB real MP4, 1080x1920, real audio track), and
once through the actual browser UI with Playwright (idea → generating
state → a real video element with working playback and a working
download link), zero console errors either time.

`features.csv` updated: 4 must-haves now fully real for faceless (script,
visuals; voiceover and captions moved from no/partial to real-but-robotic
partial). Parity 40.4 → 53.2/100, 2 → 4 of 10 must-haves done.

## Deployment + a real (if minimal) paygate

Two things needed before this can actually earn money, both added this
pass:

- **`Dockerfile`** (multi-stage, `node:22-slim`, ffmpeg + espeak-ng +
  curl in the runtime stage, Next.js `output: "standalone"`). Needed
  because the generation pipeline shells out to system binaries and
  takes 2-4 minutes -- incompatible with Vercel's default serverless
  hosting. Verified what this sandbox's networking allows: the
  standalone build itself produces the right output and runs correctly
  end to end (every route 200s, the generate API starts processing).
  Couldn't build/run the actual Docker image here -- this sandbox's
  container network can't resolve any host at all inside `docker build`,
  a constraint of this sandbox, not of Railway/Render's build servers.
  `DEPLOY.md` has the step-by-step Railway instructions (account
  creation, env vars, custom domain) for the parts only the user can do.
- **A Stripe paygate** (`lib/stripe.ts`, `app/api/checkout/`,
  `generate-faceless`'s route updated to require it): one-time
  Stripe Checkout payment per video, no accounts or database needed.
  Off by default -- generation stays free until `STRIPE_SECRET_KEY` is
  set on the host, so the app never breaks for lack of a key, and the
  whole flow (idle → pay gate appears once configured → Checkout
  redirect → back with a session id → payment verified server-side
  against Stripe itself, not trusted from the client → session marked
  redeemed so it can't be reused → generation proceeds) was exercised
  with a fake key to confirm the gate renders, blocks generation until
  paid, and fails the way a real invalid-payment attempt should (a
  visible error, not a crash). Couldn't test an actual successful
  charge -- that needs a real Stripe account, which only the user can
  create.

## Next

The remaining must-haves (background music, real credit enforcement, a
non-robotic voice, more than one template) all cost real money to solve
properly -- there's no further $0 move here without quality tradeoffs
stacking up (e.g. a worse free TTS than espeak doesn't really exist).
When there's budget: wire a paid provider behind the same
generateScript/generateImage/generateVoice call sites in
`free-pipeline.ts` (drop-in replacement, no screen changes), do the same
for the other 6 templates, and tie `spend_credits()` (already written and
tested in `schema.sql`) to the real generation call. Real auth/billing
(`/replica-backend`'s Supabase + Stripe work) still needs real
credentials the user hasn't provided. Re-run the e2e suite once the data
layer is real, then `/replica-diff` again for an updated parity score.
