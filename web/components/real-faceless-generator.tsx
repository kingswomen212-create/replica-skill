"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Download, AlertTriangle, Sparkles, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";

type Status = "idle" | "generating" | "ready" | "error";

export function RealFacelessGenerator() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const canceled = searchParams.get("canceled") === "1";

  const [idea, setIdea] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [scenes, setScenes] = useState<{ scriptText: string }[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [payment, setPayment] = useState<{ configured: boolean; priceCents: number | null } | null>(null);
  const [startingCheckout, setStartingCheckout] = useState(false);

  useEffect(() => {
    fetch("/api/checkout")
      .then((r) => r.json())
      .then(setPayment)
      .catch(() => setPayment({ configured: false, priceCents: null }));
  }, []);

  const needsPayment = payment?.configured && !sessionId;

  async function onPay() {
    setStartingCheckout(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const body = await res.json();
      if (!res.ok || !body.url) throw new Error(body.error ?? "couldn't start checkout");
      window.location.href = body.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start checkout.");
      setStartingCheckout(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (idea.trim().length < 4) {
      setError("Give it a bit more to work with — a sentence is enough.");
      return;
    }
    setError(null);
    setStatus("generating");
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);

    try {
      const res = await fetch("/api/generate-faceless", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, style: "cinematic", sessionId: sessionId ?? undefined }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "generation failed" }));
        if (res.status === 402) {
          // Payment session was invalid/already used -- send back to pay again.
          router.push("/app/create/faceless");
        }
        throw new Error(body.error ?? "generation failed");
      }
      const scenesHeader = res.headers.get("X-Scenes");
      const warningsHeader = res.headers.get("X-Warnings");
      if (scenesHeader) setScenes(JSON.parse(decodeURIComponent(scenesHeader)));
      if (warningsHeader) setWarnings(JSON.parse(decodeURIComponent(warningsHeader)));

      const blob = await res.blob();
      setVideoUrl(URL.createObjectURL(blob));
      setStatus("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed. Try again.");
      setStatus("error");
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <Card className="border-accent/30 bg-accent/5">
        <p className="flex items-center gap-2 text-sm font-medium text-text">
          <Sparkles className="size-4 text-accent" aria-hidden /> Real generation, free AI tier
        </p>
        <p className="mt-1 text-xs text-muted">
          This calls real, free AI services (no API key) end to end: a script, 4 AI-generated
          images, and a synthesized voiceover, composited into an actual video with ffmpeg.
          Because the free image API allows one image every 45 seconds per visitor, a 4-scene
          video honestly takes <strong>2–4 minutes</strong>. The voice is a synthesized
          (robotic) one, and images carry a small watermark — both fixable later with a paid
          provider, not fixable for free.
        </p>
      </Card>

      {canceled && (
        <Toast kind="info" title="Checkout canceled" description="No charge was made. Pay again whenever you're ready." />
      )}

      {payment === null ? null : needsPayment ? (
        <Card>
          <p className="flex items-center gap-2 text-sm font-medium text-text">
            <CreditCard className="size-4 text-accent" aria-hidden /> One video, one payment
          </p>
          <p className="mt-1 text-sm text-muted">
            ${((payment.priceCents ?? 200) / 100).toFixed(2)} per video, paid securely through Stripe. No account, no subscription.
          </p>
          {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
          <Button variant="primary" className="mt-3" onClick={onPay} loading={startingCheckout} disabled={startingCheckout}>
            Pay &amp; continue
          </Button>
        </Card>
      ) : (
        <>
          {status !== "ready" && (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-text" htmlFor="real-idea">
                  What&apos;s the video about?
                </label>
                <textarea
                  id="real-idea"
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  rows={3}
                  disabled={status === "generating"}
                  placeholder="A hook, a topic, or a rough idea."
                  className="w-full rounded-md border border-border-input bg-surface px-3 py-2 text-sm text-text placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60"
                />
              </div>

              {error && (
                <Card className="border-danger/40 bg-danger/10">
                  <p role="alert" className="flex items-center gap-2 text-sm text-danger">
                    <AlertTriangle className="size-4 shrink-0" aria-hidden /> {error}
                  </p>
                </Card>
              )}

              <Button type="submit" variant="primary" size="lg" loading={status === "generating"} disabled={status === "generating"}>
                {status === "generating" ? `Generating… ${elapsed}s` : "Generate for real"}
              </Button>
              {status === "generating" && (
                <p role="status" aria-live="polite" className="text-xs text-muted">
                  Writing the script, then painting 4 scenes one at a time (rate-limited to 1 every
                  45s on the free tier)… hang tight.
                </p>
              )}
            </form>
          )}

          {status === "ready" && videoUrl && (
            <div className="space-y-4">
              <video src={videoUrl} controls className="w-full max-w-xs rounded-lg border border-border" />
              <div className="flex items-center gap-3">
                <Button asChild variant="primary">
                  <a href={videoUrl} download="reel-clone-short.mp4">
                    <Download className="size-4" aria-hidden /> Download MP4
                  </a>
                </Button>
                <Button variant="secondary" onClick={() => { router.push("/app/create/faceless"); setStatus("idle"); setIdea(""); }}>
                  Make another
                </Button>
              </div>
              {warnings.length > 0 && (
                <Toast kind="info" title="Free-tier tradeoffs" description={warnings.join(" ")} />
              )}
              {scenes.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-medium text-muted">Script used</p>
                  <ol className="space-y-1 text-xs text-muted">
                    {scenes.map((s, i) => (
                      <li key={i}>{i + 1}. {s.scriptText}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
