"use client";

import { memo } from "react";

type CountryShapeProps = {
  id: string;
  d: string;
  name: string;
  interactive: boolean;
  hovered: boolean;
  selected: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
};

export const CountryShape = memo(function CountryShape({
  id,
  d,
  name,
  interactive,
  hovered,
  selected,
  onHover,
  onSelect,
}: CountryShapeProps) {
  const className = [
    "country-path",
    interactive ? "is-interactive" : "is-muted",
    hovered ? "is-hovered" : "",
    selected ? "is-selected" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <path
      d={d}
      className={className}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? "button" : undefined}
      aria-label={interactive ? name : undefined}
      aria-pressed={interactive ? selected : undefined}
      onMouseEnter={() => {
        if (interactive) onHover(id);
      }}
      onMouseLeave={() => onHover(null)}
      onFocus={() => {
        if (interactive) onHover(id);
      }}
      onBlur={() => onHover(null)}
      onClick={() => {
        if (interactive) onSelect(id);
      }}
      onKeyDown={(event) => {
        if (!interactive) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(id);
        }
      }}
    />
  );
});
