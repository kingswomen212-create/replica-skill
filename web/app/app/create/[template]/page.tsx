import { notFound } from "next/navigation";
import { CreateForm } from "@/components/create-form";
import { templates, currentUser, planFor, planRank } from "@/lib/data/seed";

export function generateStaticParams() {
  return templates.map((t) => ({ template: t.type }));
}

export default function CreatePage({ params }: { params: { template: string } }) {
  const template = templates.find((t) => t.type === params.template);
  if (!template) notFound();

  const plan = planFor(currentUser.planId);
  if (planRank(template.minPlan) > planRank(plan.name)) {
    return (
      <div className="max-w-md">
        <h1 className="text-lg font-semibold text-text">{template.title} needs the {template.minPlan} plan</h1>
        <p className="mt-2 text-sm text-muted">
          You&apos;re on {plan.name}. Upgrade to unlock this template.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-lg font-semibold text-text">{template.title}</h1>
      <p className="mt-1 text-sm text-muted">{template.description}</p>
      <div className="mt-6">
        <CreateForm template={template} />
      </div>
    </div>
  );
}
