import Link from "next/link";
import { Clapperboard } from "lucide-react";
import { Button } from "@/components/ui/button";

// Marketing site (S01-S06) is out of scope for this build pass -- see
// replica/build-log.md. This placeholder just gets people into the app.
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg px-6 text-center">
      <Clapperboard className="size-10 text-accent" aria-hidden />
      <div>
        <h1 className="text-display font-bold text-text">Faceless videos, written by AI.</h1>
        <p className="mt-3 max-w-md text-muted">
          A script, visuals, voiceover and captions from one idea &mdash; bring your own AI
          provider keys, no watermark on paid plans.
        </p>
      </div>
      <Button asChild variant="primary" size="lg" pill>
        <Link href="/app">Open the app</Link>
      </Button>
      <p className="text-xs text-muted">
        <Link href="/design" className="underline">Design system</Link>
      </p>
    </main>
  );
}
