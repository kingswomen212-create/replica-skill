# Bugs

All found and fixed in the same pass that found them (replica-test's fix
loop: write the failing test, fix, watch it pass, keep the test). Severity
per the skill's table. Only what was reproduced is listed here.

### BUG-001: useSyncExternalStore freezes after the first update

- Severity: S2
- Flow / case: F01-H1 (discovered during replica-build, before e2e tests existed)
- Screen: S17 scene editor / live progress
- Build: fixed in ee422fc

Steps
1. Create a faceless short, watch the live generation stepper.

Expected: the stepper advances through each step as the pipeline progresses.
Actual: the stepper rendered its first state and then never updated again,
even though the underlying data kept changing.
Evidence: manual Playwright run against the dev build; confirmed by
inspecting `useVideo`/`useScenes`.
Suspected cause: `lib/data/fake-client.ts` mutated the `Video`/`Scene`
objects in place (`video.status = "generating"`) instead of replacing
them. `useSyncExternalStore` detects a change by comparing the snapshot
it got last time against the one it gets now, by reference -- a mutated
object is still the same reference, so React decided nothing had changed.
Status: fixed in ee422fc (every state change now replaces the object:
`{ ...current, ...patch }`).

### BUG-002: Button's `asChild` broke Next's static prerender

- Severity: S2
- Flow / case: n/a (build-time, every page using `<Button asChild>`)
- Screen: S01 home (`<Button asChild><Link>...</Link></Button>`)
- Build: fixed in ee422fc

Steps
1. `next build`.

Expected: build succeeds.
Actual: `Error: Slot failed to slot onto its children. Expected a single
React element child or Slottable.`
Evidence: build output.
Suspected cause: Radix `Slot` (used for `asChild`) requires exactly one
child element to merge props onto, but `Button` always wrapped its
children in a loading-icon-plus-`<span>` pair regardless of `asChild`.
Status: fixed in ee422fc (`asChild` now has its own render path that
passes `children` straight to `Slot`, skipping the wrapper).

### BUG-003: Visiting a nonexistent video id crashes the whole page

- Severity: S2
- Flow / case: nav-N2
- Screen: S17 (`/app/videos/:id`)
- Build: found and fixed in this replica-test pass

Steps
1. Visit `/app/videos/does-not-exist` (any id not in the store).

Expected: "Couldn't find that video. It may have been deleted." (the
early-return case `VideoWorkspace` already has).
Actual: full-page React error, "Application error: a client-side
exception has occurred." Console: `Minified React error #185`
("Maximum update depth exceeded").
Evidence: `e2e/nav.spec.ts` (`nav-N2`), confirmed with a direct
`pageerror` listener showing the React #185 stack.
Suspected cause: `getScenes()` returned `store.scenes.get(videoId) ?? []`
-- a brand-new `[]` array literal on every call when the id isn't in the
store. `useSyncExternalStore` compares snapshots by reference; a fresh
array every render looks like a change every time, so React re-renders
in an infinite loop until it gives up.
Status: fixed (added a single shared `EMPTY_SCENES` constant as the
fallback instead of a new literal each call). Regression test:
`e2e/nav.spec.ts` `nav-N2`.

### BUG-004: music-video gets stuck permanently "failed," can never export

- Severity: S2
- Flow / case: F03-H1
- Screen: S17, music-video template
- Build: found and fixed in this replica-test pass

Steps
1. Create a music-video. Wait for generation to finish.
2. Retry the scene that fails on the first pass (by design, to exercise
   the error state).

Expected: once every scene is ready, the video becomes exportable.
Actual: Download in 4K never appears, no matter how many times the
failed scene is retried.
Evidence: `e2e/f02-f03-templates.spec.ts` (`F03-H1`) timed out waiting
for the export button; reproduced manually by watching scene statuses
flip to "generating" twice per scene instead of once.
Suspected cause: `generateVideo`'s `visualishSteps` set (the steps that
run the per-scene generation loop) wrongly included `syncing_to_beat`
alongside `generating_visuals` for music-video's step sequence. Both
steps ran the full per-scene loop, so every scene -- including the one
with a forced first-pass failure -- got regenerated a second time, which
re-applied the forced failure every single pass with no way to ever get
past it.
Status: fixed (`syncing_to_beat` removed from `visualishSteps`; exactly
one per-scene step per template now, everything else is a flat delay).
Regression test: `e2e/f02-f03-templates.spec.ts` `F03-H1`.

### BUG-005: selected voice/style chip text fails WCAG AA contrast

- Severity: S3
- Flow / case: F01-E7 (accessibility scan)
- Screen: S10 and every other creator screen (voice/style pickers)
- Build: found and fixed in this replica-test pass

Steps
1. Open any `/app/create/:template` page.
2. Run an axe scan, or just read the selected voice/style chip's text
   against its background.

Expected: WCAG 2 AA, 4.5:1 for normal text.
Actual: `text-accent` (#6350d8) on `bg-accent/10` over the page background
(#0b0b0f) measured 3.43:1; the trait text next to it (further dimmed with
`opacity-70`) measured 2.23:1; even the *unselected* chip's trait text
measured 4.18:1, just under the line.
Evidence: axe-core violation in `e2e/f01-faceless.spec.ts` (`F01-E7`),
full contrast data in the test's failure output.
Suspected cause: tokens.json's accent passes contrast against the plain
page background (that's what `contrast.py` checks), but a translucent
`accent/10` background isn't one of the checked pairs, and the chip
component used accent-colored text on it regardless.
Status: fixed (selected chips use `text-text` instead of `text-accent`,
relying on the `border-accent` + tinted background for the selected
indicator instead of the text color; trait text dropped `opacity-70` and
uses `text-muted` at full opacity, which tokens.json already verifies).
Regression test: `e2e/f01-faceless.spec.ts` `F01-E7` (axe scan, asserts
zero serious/critical violations).

## Infrastructure note (not a product bug)

Playwright's own `webServer` config auto-starting `next start` produced
consistent, severe slowdowns (a pipeline that finishes in ~3-4s against a
manually-started server took 15-30s+ or timed out outright against the
auto-started one, with identical application code). Switched to starting
the server manually with stdout redirected to a file and removed the
`webServer` block from `playwright.config.ts`. Documented in the config
itself so this doesn't get silently reintroduced. This affects how the
*tests* are run, not the cloned app.

## Test-authoring mistakes caught along the way (not product bugs)

- `getByRole("button", { name: "Generate" })` without `exact: true` also
  matched "Regenerate scene N" buttons (substring match is the default).
  Fixed by adding `exact: true` everywhere the literal "Generate" button
  is targeted.
- `getByRole("alert")` matched both the form's own validation message and
  Next.js's route-announcer element (which also carries `role="alert"`).
  Fixed by matching on the validation message's text instead.
- `Promise.all([button.click(), button.click()])` hung for the full test
  timeout when the first click triggered navigation away from the
  button: `click()` retries its actionability check against a stale
  element handle, and the button was never coming back. Fixed by using
  `dispatchEvent("click")` for both, which fires the event immediately
  without that retry loop -- actually exercising the double-submit race
  instead of getting stuck on Playwright's own retry semantics.

## Not yet run (needs replica-backend)

Out-of-credits enforcement (F01-N1), real OAuth failures, and real
payment declines all need real backend state to test against; they're
noted as such in `test-plan.md` rather than faked here.
