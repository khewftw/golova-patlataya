"use client";

import { Minus, Plus, RotateCcw } from "lucide-react";

type MapControlsProps = {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
};

export function MapControls({ onZoomIn, onZoomOut, onReset }: MapControlsProps) {
  const buttonClass =
    "grid size-10 place-items-center rounded-sm border border-[color:var(--rule)] bg-[color:var(--paper)]/90 text-ink transition hover:border-accent hover:text-accent";

  return (
    <div className="absolute right-4 bottom-24 z-20 flex flex-col gap-2 md:right-6 md:bottom-8">
      <button type="button" className={buttonClass} onClick={onZoomIn} aria-label="Приблизить">
        <Plus size={16} />
      </button>
      <button type="button" className={buttonClass} onClick={onZoomOut} aria-label="Отдалить">
        <Minus size={16} />
      </button>
      <button type="button" className={buttonClass} onClick={onReset} aria-label="Сбросить вид">
        <RotateCcw size={15} />
      </button>
    </div>
  );
}
