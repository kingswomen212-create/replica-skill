"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// No real auth in this build pass -- this is a presentational stand-in
// that drops you into /app as the seeded demo user (lib/data/seed.ts).
export default function SignInPage() {
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/app");
  }

  return (
    <main className="mx-auto flex max-w-sm flex-col items-center px-6 py-20">
      <h1 className="text-xl font-semibold text-text">Sign in</h1>
      <p className="mt-1 text-sm text-muted">Welcome back.</p>

      <Card className="mt-8 w-full">
        <Button variant="secondary" className="w-full">
          <Globe className="size-4" aria-hidden /> Continue with Google
        </Button>
        <div className="my-4 flex items-center gap-3 text-xs text-muted">
          <div className="h-px flex-1 bg-border" />
          or
          <div className="h-px flex-1 bg-border" />
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-text">Email</label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-md border border-border-input bg-surface px-3 py-2 text-sm text-text placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm text-text">Password</label>
            <input
              id="password"
              type="password"
              required
              className="w-full rounded-md border border-border-input bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>
          <Button type="submit" variant="primary" className="w-full">
            Sign in
          </Button>
        </form>
      </Card>

      <p className="mt-6 text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-accent hover:underline">Create one</Link>
      </p>
    </main>
  );
}
