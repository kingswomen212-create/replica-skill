# Component specs

Tokens: `tokens.json` / `tokens.css`. Icons: an open set (Lucide), never the
original's iconography. Base primitives: Radix UI (unstyled, accessible),
styled with these tokens — build once in isolation at `/design` before any
real screen uses them.

```
Button
  variants  primary, secondary, ghost, danger
  sizes     sm 32px, md 40px, lg 48px
  states    default, hover (surface-raised bg on secondary/ghost; accent
            darkened 8% on primary), active, focus-visible (2px ring,
            accent, 2px offset), disabled (40% opacity, no pointer events),
            loading (spinner replaces leading icon, label stays for
            screen readers via aria-busy)
  tokens    primary: bg accent, text on-accent, radius pill (marketing),
            radius md (in-app); secondary: bg surface, text text, border
            border; ghost: transparent, text text; danger: bg danger,
            text on-accent
  a11y      real <button>, visible focus ring never suppressed, loading
            state keeps accessible name via aria-busy + aria-live region
  used on   all screens

Badge / pill
  variants  default (border, surface bg), accent (accent-tinted bg), status
            (success/warning/danger dot + label)
  states    default
  tokens    radius pill, text xs/500, padding space-2 space-3
  used on   S01 ("Loved by N creators" equivalent), plan cards, channel
            connection status

Template card
  variants  marketing (large, icon + title + description + tag chips +
            CTA), in-app (compact, icon + title, selectable)
  states    default, hover (surface-raised, border brightens), selected
            (accent border, accent-tinted bg), disabled (plan-gated
            template, 40% opacity + lock icon)
  tokens    bg surface, border border, radius lg, shadow card on hover
  a11y      selectable cards are real <button> or radio-group items, not
            divs with onClick
  used on   S01, S06, S09

Voice picker
  variants  list item (flag + name + trait tag), with inline audio preview
  states    default, hover, selected (accent left-border + bg tint),
            previewing (play icon -> pause icon + waveform pulse)
  tokens    bg surface, selected bg surface-raised, radius md
  a11y      preview button has an accessible name ("Preview Emma's voice"),
            selection is a real radio group, keyboard-navigable
  used on   S10-S16 (creators)

Style chip
  variants  text-only chip, chip with thumbnail swatch
  states    default, hover, selected (accent border + accent text)
  tokens    radius pill, border border, text sm
  used on   S02, S10-S16

Progress stepper (generation pipeline)
  variants  3-step overview (marketing), live sub-status (in-app: "Writing
            script" -> "Painting visuals" -> ... with a NOW marker and an
            estimated time remaining)
  states    pending, active (pulsing accent dot + live region announcing
            the current step), done (check icon), failed (danger icon +
            retry button)
  tokens    bg surface, active step text accent, done step text-muted
  a11y      the whole stepper is an aria-live="polite" region so screen
            reader users hear each step change without a page refresh;
            failed state moves focus to the retry button
  used on   S03 (marketing explainer), S17 (real generation — this is the
            sharper-scene-editor differentiator: per-scene status, not one
            global bar)

Scene card
  variants  compact (thumbnail + duration), expanded (editable script text,
            visual prompt, regenerate button)
  states    pending, generating (skeleton shimmer), ready, regenerating
            (previous frame stays visible, dimmed, while the new one loads
            — never a blank flash), failed (inline error + retry)
  tokens    bg surface, radius md, shadow card
  a11y      regenerate button has an accessible name including the scene
            number ("Regenerate scene 3"); drag-to-reorder has a keyboard
            equivalent (move up/down buttons)
  used on   S17

Pricing card
  variants  standard, "most popular" (accent border + badge)
  states    default, selected (on the billing-interval toggle)
  tokens    bg surface, "most popular" border accent, radius lg
  used on   S04

Comparison table
  variants  —
  states    row hover (surface-raised)
  tokens    border border between rows, text-muted for secondary values
  a11y      a real <table> with scoped headers, not a div grid — screen
            reader users can navigate it by column
  used on   S04

Channel connect card (Autopilot)
  variants  one per platform icon
  states    disconnected (ghost button "Connect"), connected (platform
            name + account handle + "Disconnect"), expired (warning badge
            + "Reconnect" — see architecture.md's token-refresh job),
            error (danger badge + reason)
  tokens    bg surface, warning/danger states use the matching token for
            the badge only, not the whole card
  used on   S19, S20, S22

Credit meter
  variants  compact (nav bar: number + icon), full (billing page: bar +
            number + "N videos left at your current tier")
  states    normal, low (<10% remaining, warning colour), empty (danger
            colour, generate buttons disabled with an upgrade prompt
            instead of a silent failure)
  tokens    bar bg surface, fill accent (normal) / warning / danger
  used on   nav (all in-app screens), S21

Accordion (FAQ)
  variants  —
  states    collapsed, expanded
  tokens    border border between items, radius md
  a11y      button trigger with aria-expanded, panel has role="region"
  used on   S05

Toast / notification
  variants  success, error, info
  states    entering, visible, leaving (motion.base, token ease)
  tokens    bg surface-raised, left border-left 3px in the matching
            semantic colour, shadow pop
  a11y      role="status" (success/info) or role="alert" (error), so it's
            announced without stealing focus
  used on   all in-app screens (credit spent, publish succeeded, OAuth
            token expired, generation failed)

Nav bar
  variants  marketing (logo, links, sign in/up), in-app (logo, credit
            meter, account menu)
  states    default, scrolled (surface bg + border appears, was
            transparent at top)
  tokens    bg transparent->surface, border border (scrolled only)
  used on   all pages
```

## Build check

Primitives built at `/design` (Button, Badge, Template card, Scene card,
Pricing card, Credit meter, Toast) and screenshotted. Contrast report:

```
$ python3 contrast.py replica/design/tokens.json
11 pairs, 0 failing AA
```

Next: `/replica-build`.
