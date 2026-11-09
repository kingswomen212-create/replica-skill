import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const STEPS = [
  {
    n: "01",
    title: "Pick a template.",
    body: "Faceless, avatar, music video and more. Each one knows what it needs: a script, a photo, a track, or a prompt.",
  },
  {
    n: "02",
    title: "The pipeline makes your video.",
    body: "Script, visuals, voiceover, captions and music, generated and synced automatically, with live progress per step.",
  },
  {
    n: "03",
    title: "Fix what you don't like, then export.",
    body: "Regenerate any single scene without starting over, then export in 4K with no watermark.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-display font-bold text-text">From idea to video in minutes.</h1>
      <p className="mt-3 text-muted">One pipeline. Every template adapts it to what it&apos;s making.</p>

      <div className="mt-12 space-y-6">
        {STEPS.map((s) => (
          <Card key={s.n} className="flex gap-4">
            <span className="text-2xl font-bold text-accent">{s.n}</span>
            <div>
              <h2 className="text-lg font-semibold text-text">{s.title}</h2>
              <p className="mt-1 text-sm text-muted">{s.body}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Button asChild variant="primary" size="lg" pill>
          <Link href="/signup">Start free</Link>
        </Button>
      </div>
    </main>
  );
}
