import Link from "next/link";
import {
  Clapperboard,
  Mic2,
  Music2,
  Film,
  Bone,
  PersonStanding,
  Clapperboard as ClipIcon,
  KeyRound,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { templates } from "@/lib/data/seed";

const ICONS: Record<string, LucideIcon> = {
  faceless: Clapperboard,
  avatar: Mic2,
  music_video: Music2,
  long_form: Film,
  skeleton: Bone,
  character: PersonStanding,
  clip: ClipIcon,
};

export default function HomePage() {
  return (
    <main>
      <section className="mx-auto max-w-3xl px-6 pb-16 pt-20 text-center">
        <Badge variant="accent" className="mx-auto">No watermark on paid plans</Badge>
        <h1 className="mt-6 text-display-lg font-bold text-text">
          Faceless videos, <span className="text-accent">written by AI.</span>
        </h1>
        <p className="mt-4 text-lg text-muted">
          A script, visuals, voiceover and captions from one idea. Bring your own AI provider
          keys instead of being locked to ours, and edit scene by scene instead of
          generate-and-pray.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button asChild variant="primary" size="lg" pill>
            <Link href="/signup">Start creating free</Link>
          </Button>
          <Button asChild variant="secondary" size="lg" pill>
            <Link href="/how-it-works">See how it works</Link>
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted">No credit card required</p>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <h2 className="text-center text-xl font-semibold text-text">Every format, one engine.</h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {templates.map((t) => {
            const Icon = ICONS[t.type];
            return (
              <Card key={t.type}>
                <Icon className="size-6 text-accent" aria-hidden />
                <h3 className="mt-3 text-base font-semibold text-text">{t.title}</h3>
                <p className="mt-1 text-sm text-muted">{t.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border bg-surface/40">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-center text-xl font-semibold text-text">
            Three things most AI video tools don&apos;t give you.
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <KeyRound className="size-6 text-accent" aria-hidden />
              <h3 className="mt-3 font-medium text-text">Your own AI keys</h3>
              <p className="mt-1 text-sm text-muted">
                Bring a key for script, voice or visuals and it&apos;s used instead of the shared
                default. Cheaper, and never a lock-in.
              </p>
            </div>
            <div>
              <ShieldCheck className="size-6 text-accent" aria-hidden />
              <h3 className="mt-3 font-medium text-text">No watermark, ever on a paid plan</h3>
              <p className="mt-1 text-sm text-muted">
                Every paid tier exports clean. No upsell hidden behind a logo in the corner.
              </p>
            </div>
            <div>
              <Sparkles className="size-6 text-accent" aria-hidden />
              <h3 className="mt-3 font-medium text-text">Fix one scene, not the whole video</h3>
              <p className="mt-1 text-sm text-muted">
                Regenerate a single scene in seconds instead of starting the whole generation
                over.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h2 className="text-xl font-semibold text-text">Your first video is two minutes away.</h2>
        <p className="mt-2 text-muted">Sign up and get free credits, enough for your first short video.</p>
        <Button asChild variant="primary" size="lg" pill className="mt-6">
          <Link href="/signup">Start free</Link>
        </Button>
      </section>
    </main>
  );
}
