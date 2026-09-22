"use client";

import { SITE } from "@/data/site";

type MapHeaderProps = {
  storiesCount: number;
  editorHref?: string;
  onOpenAbout: () => void;
  onOpenIndex: () => void;
};

export function MapHeader({
  storiesCount,
  editorHref,
  onOpenAbout,
  onOpenIndex,
}: MapHeaderProps) {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between px-4 py-4 md:px-6 md:py-5">
      <div>
        <p className="font-display text-xl leading-none text-ink md:text-2xl">
          {SITE.title.toUpperCase()}
        </p>
        <button
          type="button"
          onClick={onOpenIndex}
          className="pointer-events-auto mt-2 text-[11px] tracking-[0.18em] text-muted uppercase transition hover:text-accent"
        >
          {storiesCount} историй
        </button>
      </div>
      <p className="hidden font-display text-lg tracking-[0.22em] text-ink-soft md:block">
        {SITE.period}
      </p>
      <div className="pointer-events-auto flex items-center gap-4">
        {editorHref ? (
          <a
            href={editorHref}
            className="text-[12px] tracking-[0.16em] text-ink-soft uppercase underline decoration-accent/30 underline-offset-4 hover:text-accent"
          >
            Материалы
          </a>
        ) : null}
        <button
          type="button"
          onClick={onOpenAbout}
          className="text-[12px] tracking-[0.16em] text-ink uppercase underline decoration-accent/40 underline-offset-4 hover:text-accent"
        >
          О проекте
        </button>
      </div>
    </header>
  );
}
