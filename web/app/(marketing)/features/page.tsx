import { KeyRound, Wand2, Mic, Captions, Music, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { voices, styles } from "@/lib/data/seed";

export default function FeaturesPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-display font-bold text-text">Everything the pipeline does for you.</h1>
      <p className="mt-3 max-w-2xl text-muted">
        One idea goes in. A script, scene visuals, a voiceover, synced captions and a mastered
        export come out — in whichever template fits what you&apos;re making.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card>
          <KeyRound className="size-6 text-accent" aria-hidden />
          <h2 className="mt-3 text-lg font-semibold text-text">Bring your own AI keys</h2>
          <p className="mt-2 text-sm text-muted">
            Script, voice and visuals each take an optional key of your own. Set one and it
            replaces the shared default for that step, at your provider&apos;s own rate.
          </p>
        </Card>
        <Card>
          <Wand2 className="size-6 text-accent" aria-hidden />
          <h2 className="mt-3 text-lg font-semibold text-text">A style for every scene</h2>
          <p className="mt-2 text-sm text-muted">
            {styles.length} visual styles to start, from cinematic to flat explainer. Every scene
            can carry its own prompt on top of the style.
          </p>
        </Card>
        <Card>
          <Mic className="size-6 text-accent" aria-hidden />
          <h2 className="mt-3 text-lg font-semibold text-text">A voice that fits the niche</h2>
          <p className="mt-2 text-sm text-muted">
            Pick from a growing voice list ({voices.length} to start, more on the way), each with
            its own language and tone.
          </p>
        </Card>
        <Card>
          <Captions className="size-6 text-accent" aria-hidden />
          <h2 className="mt-3 text-lg font-semibold text-text">Captions that stay in sync</h2>
          <p className="mt-2 text-sm text-muted">
            Every export carries captions timed to the voiceover automatically — no separate
            captioning pass.
          </p>
        </Card>
        <Card>
          <Music className="size-6 text-accent" aria-hidden />
          <h2 className="mt-3 text-lg font-semibold text-text">Background music, scored in</h2>
          <p className="mt-2 text-sm text-muted">
            A royalty-free bed under every export, matched to the template&apos;s mood, or bring
            your own track for a music video.
          </p>
        </Card>
        <Card>
          <Download className="size-6 text-accent" aria-hidden />
          <h2 className="mt-3 text-lg font-semibold text-text">4K, no watermark</h2>
          <p className="mt-2 text-sm text-muted">
            Every paid plan exports clean at full resolution. Nothing held back for a higher tier.
          </p>
        </Card>
      </div>
    </main>
  );
}
