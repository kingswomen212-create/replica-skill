import { AppNav } from "@/components/app-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      <AppNav />
      <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
    </div>
  );
}
