# Parity: Reel Clone vs aituber.app

Build: d56a6df  Date: 2026-11-09

## Overall: 37.7 / 100

- **Feature score: 40.4** (21 counted, 2 of 10 must-haves fully done)
- **Layout score: 27.1** (5 marketing screens compared; DIFFERENT on all 5)

**Verdict: not shippable.** 8 must-haves are missing or partial, and must-haves
missing means not shippable regardless of the overall number.

This is the honest number for a shell-plus-vertical-slice build whose AI
pipeline and backend are still simulated (see `replica/build-log.md`). It
is not a judgment on the design or the code quality of what's built — it
measures whether a user could do everything they can do in the original
today, and mostly they can't yet, because the thing that does the actual
work (real script/voice/visual generation, real auth, real billing)
hasn't been wired to a real backend.

## Feature parity (40.4 / 100)

By area, weakest first:

| area | score | features |
| --- | --- | --- |
| publishing | 0.0 | 1 |
| growth | 0.0 | 1 |
| team | 0.0 | 1 |
| platform | 0.0 | 1 |
| creation | 37.9 | 12 |
| onboarding | 50.0 | 1 |
| export | 50.0 | 1 |
| billing | 50.0 | 1 |
| automation | 50.0 | 1 |
| editing | 100.0 | 1 |

Missing, in build order (full detail and notes in `replica/features.csv`):

**Must-haves (8 of 10 not fully done):**
1. Generate a voiceover in a chosen voice and language — no audio produced
2. Auto-sync captions to the voiceover — no caption track produced
3. Add background music — no music UI yet
4. Credit-based usage metering — UI only, no enforcement
5. Generate a script from an idea — simulated lines, no real LLM
6. Generate per-scene AI visuals — simulated placeholders, no real image/video-gen
7. Download the finished video in 4K — flow works, no file is actually produced
8. Sign up with email or Google — routes work, no real auth

**Should-haves (5 of 6 not fully done):** multi-language voice/captions,
one-click publish to a channel, and avatar/music-video/long-form modes
(each has real distinct *behavior* now, per the replica-build widening
pass, but still run on the same simulated AI calls underneath).

**Could-haves:** idea/topic finder, niche landing pages, team seats,
API/MCP access, and Autopilot (interactive against local state, no real
OAuth or scheduler) are all either missing or partial.

Left out on purpose, not scored (see `features.csv` for the full reasons):
the licensed ElevenLabs voice roster, aituber.app's proprietary
generation model, its brand, its affiliate network, and its marketing
site's testimonials/follower numbers.

## Layout diff (27.1 / 100, 5 screens)

| screen | score | grade | note |
| --- | --- | --- | --- |
| S03 how it works | 21.1 | different | clone 66% shorter |
| S05 FAQ | 24.2 | different | clone 51% shorter |
| S04 pricing | 27.1 | different | clone 73% shorter |
| S02 features | 29.2 | different | clone 54% shorter |
| S01 home | 34.0 | different | clone 79% shorter |

Every comparable screen scores DIFFERENT, and the dominant reason on all
five is the same: **the clone's marketing pages are shorter**, not
differently structured. They weren't built to match the original
section-for-section — per replica-design's rules, colour and exact
layout are trade dress that change before launch anyway, and the
`replica-build` pass scoped the marketing site to five core sections
(hero, template grid, differentiator callouts, CTA) rather than
replicating every block the original has (e.g. a full 1300+-voice
showcase grid, a testimonial carousel, an autopilot growth-stats teaser
on the homepage, a detailed plan-comparison table on pricing). None of
those are features this clone is missing — they're marketing-page
*content density* the build pass didn't prioritize matching. Diff images
in `replica/diffs/S01.png` through `S05.png`.

No layout diff exists yet for the 16 in-app screens (S09-S22) because
there's no reference screenshot for them — recon never logged into a
real aituber.app account (per its clean-room sourcing rule), so those
screens were built from inferred route names and marketing copy, not
pixel references. A real comparison there would need the user's own
account.

## Behaviour diff

Limited by the same thing: recon only had public marketing pages to work
from, not a real account, so a true click-by-click comparison against
the original's actual app isn't possible from here. What can be said
honestly:

| flow | original (from recon/marketing copy) | clone does | assessment |
| --- | --- | --- | --- |
| Core creation loop | "idea to video in minutes," roughly 3-4 clicks per recon's F01 | dashboard → template → idea + Generate → Download: 3 clicks | comparable, not verified against the real click count |
| Export | marketing copy shows both "Publish Now" and download together on the result screen | clone's video page only has Download; publishing lives separately in Autopilot's per-channel connect flow, not on the video itself | **gap**: no one-click "publish this video to a connected channel" button exists yet outside Autopilot |
| Signup incentive | FAQ: "100 free credits" tied to signing up | clone's signup always hands the same static seeded balance (1,840 credits); nothing is actually granted at signup | **gap**: signup and credits aren't connected at all yet |
| What's remembered between visits | a real account persists everything | **nothing persists** — every fake data store (videos, channels, provider keys) lives in browser memory and resets on a full page reload | **the single biggest practical gap** for a real demo; not visible in a single click-through, but matters immediately on a second visit |
| Error handling on a failed scene | not observed (recon flagged this screen as inferred, not seen) | regenerate-on-failure works end to end, verified by the replica-test pass (BUG-004 found and fixed here) | can't compare to the original; clone's own behavior is now solid |

## Top five things to build next

1. **Publish-from-the-video-page**, not just from Autopilot — closes the
   clearest behavioral gap found above, and it's a should-have already
   scoped (`features.csv`: "one-click publish to a connected channel").
2. **Wire one real AI call** (script generation is the best first target —
   see `build-log.md`'s "Next") so the feature score's "partial" rows
   start moving to "yes" instead of staying simulated indefinitely.
3. **Real auth + a persistence layer**, even a minimal one — the "nothing
   survives a refresh" gap undercuts every other feature's credibility
   in a live demo, more than any single missing must-have does.
4. **Credit enforcement**, tied to whichever real AI call lands first —
   `spend_credits()` already exists and is tested in `schema.sql`
   (see `replica-architect`'s pass); it just isn't called from anywhere yet.
5. **A real reference pass on the 16 in-app screens** once the user's own
   aituber.app account is available — right now there's no layout score
   for the majority of the app because recon had nothing to screenshot
   against.

Next: `/replica-build` for the gaps above (the real backend work is
currently blocked on credentials — see `build-log.md`), or
`/replica-entrepreneur` to find the angle worth building toward once
parity is closer.
