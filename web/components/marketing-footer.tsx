import Link from "next/link";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/signup", label: "Create account" },
      { href: "/signin", label: "Sign in" },
      { href: "/app", label: "Open the app" },
    ],
  },
  {
    title: "Reference",
    links: [{ href: "/design", label: "Design system" }],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div>
            <p className="font-semibold text-text">Reel Clone</p>
            <p className="mt-2 text-sm text-muted">Faceless videos, written by AI.</p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-medium text-text">{col.title}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-muted hover:text-text">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 text-xs text-muted">
          A portfolio clone project built with the Replica skill pack. Not affiliated with any
          product it studies.
        </p>
      </div>
    </footer>
  );
}
