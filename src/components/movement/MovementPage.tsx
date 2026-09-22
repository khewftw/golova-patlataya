import Link from "next/link";
import { SITE } from "@/data/site";

type MovementPageProps = {
  children: React.ReactNode;
};

export function MovementPage({ children }: MovementPageProps) {
  return (
    <div className="min-h-dvh bg-paper">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[color:var(--rule)] bg-paper/90 px-5 py-3 backdrop-blur-sm">
        <Link href="/" className="font-display text-lg tracking-[0.04em]">
          {SITE.title}
        </Link>
        <p className="hidden text-[11px] tracking-[0.18em] text-muted uppercase md:block">
          {SITE.period}
        </p>
        <Link
          href="/"
          className="text-[12px] tracking-[0.14em] text-accent uppercase underline underline-offset-4"
        >
          К карте
        </Link>
      </header>
      {children}
    </div>
  );
}
