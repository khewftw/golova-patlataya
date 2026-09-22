"use client";

import { SITE } from "@/data/site";

type MapHeaderProps = {
  editorHref?: string;
  onOpenAbout: () => void;
};

export function MapHeader({
  editorHref,
  onOpenAbout,
}: MapHeaderProps) {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between px-4 py-4 md:px-6 md:py-5">
      <div>
        <p className="font-display text-xl leading-none text-ink md:text-2xl">
          {SITE.title.toUpperCase()}
        </p>
      </div>
      <p className="mt-2 hidden font-display text-lg tracking-[0.22em] text-ink-soft md:block">
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
