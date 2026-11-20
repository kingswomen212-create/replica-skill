# Deploying this (Railway)

This app shells out to `ffmpeg` and `espeak-ng` and a single generation
request takes 2-4 minutes. That needs a real, always-on container host.
**It will not work on Vercel's default hosting** (no system binaries,
and requests get cut off after 10-60 seconds there). Railway is the
recommended path below; Render and Fly.io work the same way since they
all build from the `Dockerfile` in this folder.

## 1. Push this repo to GitHub

If it isn't already, Railway deploys from a GitHub repo.

## 2. Create a Railway account and project

1. Go to [railway.app](https://railway.app) and sign up (free, a GitHub
   login is the fastest way in).
2. **New Project → Deploy from GitHub repo**, pick this repo
   (`kingswomen212-create/replica-skill`).
3. **The only thing to check**: when Railway asks which branch, pick
   **`claude/jolly-brown-c2t3p5`** (not `main` — that's where this app's
   code lives). If a service already exists from a previous attempt, its
   **Settings → Source → Branch** is where to change it.
4. That's it — no "Root Directory" setting to find or change.
   `railway.json` (at the repo root and inside `web/`, so it's found
   either way) tells Railway exactly which Dockerfile to build, so it
   configures itself.
5. It builds and deploys automatically on push after this. The free
   trial credit covers the first chunk of usage; after that it's
   usage-based, roughly $5/month for a small always-on service.

## 3. Environment variables

In the Railway project's **Variables** tab, add:

| Variable | Required? | What it does |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | Optional | Leave unset and generation stays free. Set it (your Stripe **secret** key, starts `sk_live_` or `sk_test_`) to turn on the paygate. |
| `STRIPE_PRICE_CENTS` | Optional | Price per video in cents, e.g. `250` for $2.50. Defaults to `200` ($2.00) if unset. |

Nothing else is required to run — there's no database and no other
third-party service in this build yet.

## 4. Get a Stripe key (only if you want to charge for videos)

1. Sign up at [stripe.com](https://stripe.com) (free).
2. Dashboard → **Developers → API keys**. Use the **secret key**
   (`sk_test_...` while testing, `sk_live_...` once you're ready to take
   real payments — Stripe keeps test and live payments completely
   separate).
3. Paste it into Railway's `STRIPE_SECRET_KEY` variable above.
4. Stripe also needs your bank details before it pays out real money to
   you — **Settings → Payouts** in the Stripe dashboard.

## 5. Custom domain

Once deployed, Railway gives you a `*.up.railway.app` URL that works
immediately. To use your own domain: buy one (Namecheap, Porkbun, Cloudflare
Registrar are all cheap, ~$10-12/year for a `.com`), then in Railway's
project **Settings → Networking → Custom Domain**, add it and follow the
CNAME/A record instructions it gives you — you add those records at
wherever you bought the domain.

## Sanity-checking a deploy

Once it's live:

1. Visit `/app/create/faceless` on the deployed URL.
2. If `STRIPE_SECRET_KEY` is unset, you should see the idea box
   immediately. If it's set, you should see the "Pay & continue" card
   with the right price.
3. Generate one video (or pay with a Stripe **test card**,
   `4242 4242 4242 4242`, any future expiry, any CVC, while
   `STRIPE_SECRET_KEY` is still the test key) and confirm it actually
   produces a downloadable video. Don't flip to the live key until this
   works.
