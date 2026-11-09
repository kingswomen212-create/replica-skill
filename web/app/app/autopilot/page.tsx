import { Radio } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PLATFORMS = ["YouTube", "TikTok", "Instagram", "Facebook", "Threads", "X"];

export default function AutopilotPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="flex items-center gap-2 text-lg font-semibold text-text">
        <Radio className="size-5 text-accent" aria-hidden /> Autopilot
      </h1>
      <p className="mt-1 text-sm text-muted">
        Connect a channel, set a niche and a posting cadence, and the pipeline generates and
        publishes on a schedule, unattended.
      </p>
      <Card className="mt-6 border-dashed">
        <p className="text-sm text-text">Not wired up yet in this build pass.</p>
        <p className="mt-1 text-xs text-muted">
          Per replica/architecture.md, Autopilot needs OAuth + token-refresh for six platforms
          and a scheduler, and is built last for exactly that reason. This screen is a shell
          stub so the route exists and the layout is real.
        </p>
      </Card>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {PLATFORMS.map((p) => (
          <Card key={p} className="flex items-center justify-between">
            <span className="text-sm text-text">{p}</span>
            <Badge>Not connected</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
