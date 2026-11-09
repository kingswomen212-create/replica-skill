"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "How long does it take to generate a video?",
    a: "A short takes about a minute once you submit an idea. Long-form and music-video run longer since there's more to generate per scene.",
  },
  {
    q: "How do credits work?",
    a: "Every plan grants a monthly credit allowance. Generating a video spends credits based on its length and template; unused credits never expire.",
  },
  {
    q: "What happens if I bring my own AI key?",
    a: "Set a key for script, voice or visuals in Settings and it's used instead of the shared default for that step — usually cheaper, and not locked to one vendor.",
  },
  {
    q: "Can I regenerate just one scene?",
    a: "Yes. Every scene has its own regenerate button, so a scene you don't like doesn't mean starting the whole video over.",
  },
  {
    q: "Do I own the videos I make?",
    a: "Yes — videos you generate are yours to use, publish or sell.",
  },
  {
    q: "Is there a watermark?",
    a: "No, not on any paid plan. Every export is clean at full resolution.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, from the billing page, with no minimum term.",
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-display font-bold text-text">Answers to your questions.</h1>
      <div className="mt-10 divide-y divide-border border-y border-border">
        {FAQS.map((item, i) => {
          const open = openIndex === i;
          return (
            <div key={item.q}>
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpenIndex(open ? null : i)}
                className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {item.q}
                <ChevronDown className={cn("size-4 shrink-0 text-muted transition-transform", open && "rotate-180")} aria-hidden />
              </button>
              {open && (
                <div role="region" className="pb-4 text-sm text-muted">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
