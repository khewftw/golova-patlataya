"use client";

import { geoGraticule10, geoNaturalEarth1, geoPath } from "d3-geo";
import { useMemo } from "react";
import { CountryShape } from "@/components/map/CountryShape";
import type { MapCountryFeature } from "@/lib/map/load-world";
import type { ViewTransform } from "@/lib/map/zoom";

type HistoricalWorldMapProps = {
  countries: MapCountryFeature[];
  width: number;
  height: number;
  transform: ViewTransform;
  interactiveIds: Set<string>;
  hoveredId: string | null;
  selectedIds: Set<string>;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
};

export function HistoricalWorldMap({
  countries,
  width,
  height,
  transform,
  interactiveIds,
  hoveredId,
  selectedIds,
  onHover,
  onSelect,
}: HistoricalWorldMapProps) {
  const { path, sphere, graticule } = useMemo(() => {
    const projection = geoNaturalEarth1()
      .rotate([-10, 0])
      .fitExtent(
        [
          [24, 28],
          [width - 24, height - 36],
        ],
        { type: "Sphere" },
      );
    const generator = geoPath(projection);
    return {
      path: generator,
      sphere: generator({ type: "Sphere" }) ?? "",
      graticule: generator(geoGraticule10()) ?? "",
    };
  }, [width, height]);

  const paths = useMemo(
    () =>
      countries.map((country) => ({
        id: country.id,
        name: country.properties.name ?? country.id,
        d: path(country) ?? "",
      })),
    [countries, path],
  );

  return (
    <svg
      className="block h-full w-full touch-none"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Историческая политическая карта мира около 1 января 1950 года"
    >
      <rect width={width} height={height} fill="var(--map-sea)" />
      <g
        transform={`translate(${transform.x} ${transform.y}) scale(${transform.k})`}
      >
        <path d={sphere} fill="var(--map-sea)" stroke="none" />
        <path
          d={graticule}
          fill="none"
          stroke="var(--ink)"
          strokeOpacity={0.08}
          strokeWidth={0.4}
        />
        <path
          d={sphere}
          fill="none"
          stroke="var(--map-stroke)"
          strokeWidth={0.6}
        />
        {paths.map((country) => (
          <CountryShape
            key={country.id}
            id={country.id}
            d={country.d}
            name={country.name}
            interactive={interactiveIds.has(country.id)}
            hovered={hoveredId === country.id}
            selected={selectedIds.has(country.id)}
            onHover={onHover}
            onSelect={onSelect}
          />
        ))}
      </g>
    </svg>
  );
}
