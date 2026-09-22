"use client";

import type { MovementSummary } from "@/types/movement";

type CountryTooltipProps = {
  movement: MovementSummary | null;
  x: number;
  y: number;
  visible: boolean;
};

export function CountryTooltip({
  movement,
  x,
  y,
  visible,
}: CountryTooltipProps) {
  if (!movement || !visible) return null;

  const left = Math.min(Math.max(16, x + 16), window.innerWidth - 240);
  const top = Math.min(Math.max(16, y + 16), window.innerHeight - 120);

  return (
    <div
      role="tooltip"
      className="pointer-events-none fixed z-40 w-52 rounded-sm border border-[color:var(--rule)] bg-[color:var(--paper)]/95 px-3 py-2.5 shadow-[0_12px_40px_rgba(28,22,18,0.16)] backdrop-blur-sm"
      style={{ left, top }}
    >
      <p className="text-[10px] tracking-[0.18em] text-muted uppercase">
        {movement.historicalCountryName}
      </p>
      <p className="font-display mt-1 text-lg leading-tight text-ink">
        {movement.title}
      </p>
      <p className="mt-1 text-xs text-ink-soft">
        {movement.fromYear}–{movement.toYear}
      </p>
    </div>
  );
}
