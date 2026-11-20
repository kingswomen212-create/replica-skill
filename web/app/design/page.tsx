import { Clapperboard, Mic2, Music2, Film, Bone, PersonStanding } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Toast, LowCreditToast } from "@/components/ui/toast";
import { CreditMeterCompact, CreditMeterFull } from "@/components/ui/credit-meter";
import { TemplateCard } from "@/components/ui/template-card";
import { SceneCard } from "@/components/ui/scene-card";

export default function DesignSystemPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-12 p-8">
      <header>
        <h1 className="text-display font-bold text-text">Design system</h1>
        <p className="mt-2 text-muted">
          Primitives built from replica/design/tokens.json and components.md,
          for review before any real screen uses them.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text">Buttons</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Start creating free</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Delete video</Button>
          <Button variant="primary" loading>Generating</Button>
          <Button variant="primary" disabled>Disabled</Button>
          <Button variant="primary" pill size="lg">Pill / large</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text">Badges</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Default</Badge>
          <Badge variant="accent">Most popular</Badge>
          <Badge variant="success">Connected</Badge>
          <Badge variant="warning">Token expiring</Badge>
          <Badge variant="danger">Failed</Badge>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text">Template cards</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <TemplateCard icon={Clapperboard} title="Faceless short" description="Idea to a finished short in minutes." selected />
          <TemplateCard icon={Mic2} title="Avatar / UGC ad" description="A talking-head ad from one photo." />
          <TemplateCard icon={Music2} title="Music video" description="Visuals synced to any track's beat." />
          <TemplateCard icon={Film} title="Long-form" description="Multi-scene narration, up to 20 minutes." locked />
          <TemplateCard icon={Bone} title="Skeleton short" description="Anatomy shorts that explain themselves." locked />
          <TemplateCard icon={PersonStanding} title="Talking object" description="A mascot or product that talks." locked />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text">Scene editor</h2>
        <div className="max-w-xl space-y-2">
          <SceneCard index={0} status="ready" scriptText="Open on a dim workshop. A single bulb flickers on." />
          <SceneCard index={1} status="generating" scriptText="The narrator explains what's about to go wrong." />
          <SceneCard index={2} status="failed" scriptText="A twist nobody saw coming." />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text">Credit meter</h2>
        <div className="flex items-center gap-6">
          <Card className="w-fit"><CreditMeterCompact remaining={1840} monthly={5000} /></Card>
        </div>
        <Card className="max-w-sm">
          <CreditMeterFull remaining={120} monthly={5000} planName="Pro" />
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text">Toasts</h2>
        <div className="max-w-sm space-y-3">
          <Toast kind="success" title="Video published" description="Your short is live on YouTube." />
          <Toast kind="error" title="Generation failed" description="Scene 3 couldn't render. Retry?" />
          <LowCreditToast remaining={42} />
        </div>
      </section>
    </main>
  );
}
