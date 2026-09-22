"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { MOVEMENT_TYPE_LABELS } from "@/data/site";
import type { MovementSummary } from "@/types/movement";

type StoriesIndexProps = {
  open: boolean;
  movements: MovementSummary[];
  onClose: () => void;
};

export function StoriesIndex({ open, movements, onClose }: StoriesIndexProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Закрыть список"
        className="absolute inset-0 bg-[color:var(--backdrop)]"
        onClick={onClose}
      />
      <aside className="relative flex h-full w-full max-w-md flex-col border-l border-[color:var(--rule)] bg-paper">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-[11px] tracking-[0.18em] text-muted uppercase">Атлас</p>
            <h2 className="font-display text-2xl">{movements.length} историй</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-sm border border-[color:var(--rule)]"
            aria-label="Закрыть"
          >
            <X size={16} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-5 pb-8">
          <ul className="space-y-1">
            {movements.map((movement) => (
              <li key={movement.slug}>
                <Link
                  href={`/country/${movement.slug}`}
                  onClick={onClose}
                  className="block rounded-sm px-2 py-2.5 transition hover:bg-paper-deep"
                >
                  <p className="text-[10px] tracking-[0.16em] text-muted uppercase">
                    {movement.historicalCountryName}
                  </p>
                  <p className="font-display text-lg leading-tight">{movement.title}</p>
                  <p className="text-xs text-ink-soft">
                    {movement.fromYear}–{movement.toYear}
                    {" · "}
                    {MOVEMENT_TYPE_LABELS[movement.type]}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </div>
  );
}
