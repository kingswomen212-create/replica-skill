import {
  Clapperboard,
  Mic2,
  Music2,
  Film,
  Bone,
  PersonStanding,
  Clapperboard as ClipIcon,
  type LucideIcon,
} from "lucide-react";
import { TemplateCard } from "@/components/ui/template-card";
import { templates, currentUser, planFor, planRank } from "@/lib/data/seed";
import Link from "next/link";

const ICONS: Record<string, LucideIcon> = {
  faceless: Clapperboard,
  avatar: Mic2,
  music_video: Music2,
  long_form: Film,
  skeleton: Bone,
  character: PersonStanding,
  clip: ClipIcon,
};

export default function DashboardPage() {
  const plan = planFor(currentUser.planId);
  const userRank = planRank(plan.name);

  return (
    <div>
      <h1 className="text-xl font-semibold text-text">Pick a template</h1>
      <p className="mt-1 text-sm text-muted">
        Every template writes the script, generates visuals and voiceover, and syncs captions for you.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {templates.map((t) => {
          const locked = planRank(t.minPlan) > userRank;
          const Icon = ICONS[t.type];
          const card = (
            <TemplateCard
              key={t.type}
              icon={Icon}
              title={t.title}
              description={t.description}
              locked={locked}
            />
          );
          return locked ? (
            <div key={t.type}>{card}</div>
          ) : (
            <Link key={t.type} href={`/app/create/${t.type}`} className="block">
              {card}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
