"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CountryTooltip } from "@/components/map/CountryTooltip";
import { HistoricalWorldMap } from "@/components/map/HistoricalWorldMap";
import { MapControls } from "@/components/map/MapControls";
import { MapHeader } from "@/components/map/MapHeader";
import { MapLegend } from "@/components/map/MapLegend";
import { AboutPanel } from "@/components/ui/AboutPanel";
import { loadWorldCountries, type MapCountryFeature } from "@/lib/map/load-world";
import {
  IDENTITY_TRANSFORM,
  panBy,
  zoomAtPoint,
  type ViewTransform,
} from "@/lib/map/zoom";
import type { MovementSummary } from "@/types/movement";

type HistoricalMapClientProps = {
  movements: MovementSummary[];
  editorHref?: string;
};

export function HistoricalMapClient({ movements, editorHref }: HistoricalMapClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const selectedSlug = pathname.startsWith("/country/")
    ? (pathname.split("/")[2] ?? null)
    : null;
  const frameRef = useRef<HTMLDivElement>(null);
  const [countries, setCountries] = useState<MapCountryFeature[]>([]);
  const [size, setSize] = useState({ width: 1280, height: 800 });
  const [transform, setTransform] = useState<ViewTransform>(IDENTITY_TRANSFORM);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [aboutOpen, setAboutOpen] = useState(false);
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const skipClickRef = useRef(false);

  const byFeatureId = useMemo(() => {
    const map = new Map<string, MovementSummary>();
    for (const movement of movements) {
      for (const id of movement.mapFeatureIds) {
        map.set(id, movement);
      }
    }
    return map;
  }, [movements]);

  const interactiveIds = useMemo(
    () => new Set(movements.flatMap((movement) => movement.mapFeatureIds)),
    [movements],
  );

  const selectedIds = useMemo(() => {
    if (!selectedSlug) return new Set<string>();
    const movement = movements.find((item) => item.slug === selectedSlug);
    return new Set(movement?.mapFeatureIds ?? []);
  }, [movements, selectedSlug]);

  const hoveredMovement = hoveredId ? (byFeatureId.get(hoveredId) ?? null) : null;

  useEffect(() => {
    let cancelled = false;
    loadWorldCountries()
      .then((result) => {
        if (!cancelled) setCountries(result.countries);
      })
      .catch((error) => {
        console.error(error);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setSize({
        width: Math.max(320, Math.round(entry.contentRect.width)),
        height: Math.max(320, Math.round(entry.contentRect.height)),
      });
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  const selectFeature = useCallback(
    (id: string) => {
      if (skipClickRef.current) return;
      const movement = byFeatureId.get(id);
      if (!movement) return;
      router.push(`/country/${movement.slug}`);
    },
    [byFeatureId, router],
  );

  const zoomBy = useCallback((factor: number) => {
    setTransform((current) =>
      zoomAtPoint(current, { x: size.width / 2, y: size.height / 2 }, current.k * factor),
    );
  }, [size.height, size.width]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = frame.getBoundingClientRect();
      const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12;
      setTransform((current) => zoomAtPoint(current, point, current.k * factor));
    };

    frame.addEventListener("wheel", onWheel, { passive: false });
    return () => frame.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setHoveredId(null);
        setAboutOpen(false);
        setTransform(IDENTITY_TRANSFORM);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      ref={frameRef}
      className="atlas-grid relative z-10 h-dvh w-full overflow-hidden bg-map-sea"
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        skipClickRef.current = false;
        dragRef.current = { x: event.clientX, y: event.clientY };
      }}
      onPointerMove={(event) => {
        setPointer({ x: event.clientX, y: event.clientY });
        if (!dragRef.current) return;
        const dx = event.clientX - dragRef.current.x;
        const dy = event.clientY - dragRef.current.y;
        if (Math.hypot(dx, dy) > 4) skipClickRef.current = true;
        dragRef.current = { x: event.clientX, y: event.clientY };
        setTransform((current) => panBy(current, dx, dy));
      }}
      onPointerUp={() => {
        dragRef.current = null;
      }}
      onPointerLeave={() => {
        dragRef.current = null;
      }}
    >
      <MapHeader
        editorHref={editorHref}
        onOpenAbout={() => setAboutOpen(true)}
      />
      {countries.length > 0 ? (
        <HistoricalWorldMap
          countries={countries}
          width={size.width}
          height={size.height}
          transform={transform}
          interactiveIds={interactiveIds}
          hoveredId={hoveredId}
          selectedIds={selectedIds}
          onHover={setHoveredId}
          onSelect={selectFeature}
        />
      ) : (
        <div className="grid h-full place-items-center text-sm tracking-[0.16em] text-muted uppercase">
          Загрузка карты 1950
        </div>
      )}
      <MapLegend />
      <MapControls
        onZoomIn={() => zoomBy(1.25)}
        onZoomOut={() => zoomBy(0.8)}
        onReset={() => setTransform(IDENTITY_TRANSFORM)}
      />
      <CountryTooltip
        movement={hoveredMovement}
        x={pointer.x}
        y={pointer.y}
        visible={Boolean(hoveredMovement) && !aboutOpen}
      />
      <AboutPanel open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}
