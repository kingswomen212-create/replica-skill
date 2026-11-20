# Test plan: Reel Clone (AI faceless-video-generator clone)

Build: b49bcb0  Date: 2026-11-09  Env: local, production build (`next build && next start`), fake data layer

| case | flow | type | steps | expected | auto | result |
| --- | --- | --- | --- | --- | --- | --- |
| F01-H1 | create a faceless short | happy | sign up -> dashboard -> Faceless short -> fill idea -> Generate | lands on video page, progress stepper runs through all steps, scenes render, Download in 4K enables once every scene is ready | e2e | pass |
| F01-H2 | regenerate a failed scene | happy | same as F01-H1, wait for the forced first-pass failure on scene 4 -> click Retry | scene becomes ready, the page-level error toast clears, Download in 4K enables | e2e | pass (covered inside the F01-H1 spec) |
| F01-E1 | empty idea | edge | go to /app/create/faceless, leave the idea box blank, submit | inline validation error, no navigation, no video created | e2e | pass |
| F01-E2 | very long idea | edge | paste a 2000-character idea | form accepts it, generation proceeds normally | e2e | pass |
| F01-E3 | emoji and accents in the idea | edge | idea = "Café résumé tips 🎬✨" | accepted, title derived from it renders correctly, no mangled characters | e2e | pass |
| F01-E4 | double-click Generate | edge | click Generate twice quickly | only one video is created (button disables on first click) | e2e | pass |
| F01-E5 | mobile width | edge | 390px viewport, full F01-H1 | every control reachable and usable, no horizontal scroll | e2e | pass |
| F01-E6 | keyboard only | edge | Tab/Enter through the whole flow, no mouse | can reach and activate every control, visible focus throughout | e2e | pass |
| F01-E7 | screen-reader labels | edge | axe scan on /app/create/faceless | zero serious/critical violations | e2e | pass (failed once, BUG-005, fixed) |
| F01-N1 | out of credits | negative | set credits to 0 (seed), submit the create form | blocked with a clear message, no video created, no credit went negative | e2e | blocked -- credit enforcement isn't wired (features.csv: billing partial); needs replica-backend |
| F02-H1 | avatar video from a photo | happy | /app/create/avatar, upload a photo, fill script, Generate | single scene, photo renders as its thumbnail once ready, never forced to fail | e2e | pass |
| F03-H1 | music-video from a track | happy | /app/create/music_video, upload a file, Generate | stepper shows beat-detection wording, exactly 6 scenes generate | e2e | pass (failed twice, BUG-004, fixed) |
| F03-E1 | long-form scene count | edge | /app/create/long_form, Generate | exactly 9 scenes generate | e2e | pass |
| F04-H1 | turn on Autopilot | happy | /app/autopilot, Connect a channel, toggle Autopilot on, set a niche | channel shows Connected, niche/cadence controls appear, a run history appears | e2e | pass |
| F04-H2 | disconnect a channel | happy | from F04-H1, click Disconnect | channel reverts to "Not connected", autopilot/niche/cadence controls disappear | e2e | pass (covered inside the F04-H1 spec) |
| F05-H1 | add a BYO provider key | happy | /app/settings, Add key on Script (LLM), type a name and a key, Save | badge shows the provider name and a masked value ending in the real last 4 characters, never the full key | e2e | pass |
| F05-H2 | remove a provider key | happy | from F05-H1, Remove | badge reverts to "Using shared default" | e2e | pass (covered inside the F05-H1 spec) |
| nav-H1 | marketing site to app | happy | / -> Features -> Pricing -> How it works -> FAQ -> Sign up -> lands in /app | every link works, no 404s, no console errors | e2e | pass |
| nav-N1 | unknown template route | negative | visit /app/create/not-a-real-template | 404, not a crash | e2e | pass |
| nav-N2 | unknown video id | negative | visit /app/videos/does-not-exist | "Couldn't find that video" message, not a crash | e2e | pass (failed once, BUG-003, fixed) |

Manual / not automated this pass: real OAuth with the six platforms (Autopilot is
simulated, nothing to click through outside this app), real payment
failure (Stripe isn't wired yet, so "card declined" has nothing to test
against), screen-reader software end to end (axe scans stand in for this
pass).
