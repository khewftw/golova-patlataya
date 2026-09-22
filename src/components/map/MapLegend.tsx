import { CSHAPES_ATTRIBUTION, SITE } from "@/data/site";

export function MapLegend() {
  return (
    <aside className="pointer-events-none absolute bottom-4 left-4 z-20 max-w-[220px] text-[11px] leading-relaxed text-ink-soft md:bottom-6 md:left-6">
      <p className="font-display text-2xl text-ink">{SITE.storiesCount} историй</p>
      <p className="mt-1 tracking-[0.16em] uppercase">Выберите страну</p>
      <div className="mt-4 space-y-1.5">
        <LegendSwatch className="bg-map-interactive" label="Есть история" />
        <LegendSwatch className="bg-map-land border border-ink/15" label="Нейтральная территория" />
        <LegendSwatch className="bg-map-hover" label="Наведение" />
        <LegendSwatch className="bg-map-selected" label="Выбрано" />
      </div>
      <p className="pointer-events-auto mt-4 text-[10px] text-muted">
        Границы: {CSHAPES_ATTRIBUTION.name}, снимок {SITE.snapshotDate}. Лицензия{" "}
        <a
          href={CSHAPES_ATTRIBUTION.licenseUrl}
          className="underline decoration-accent/40 underline-offset-2 hover:text-accent"
          target="_blank"
          rel="noreferrer"
        >
          {CSHAPES_ATTRIBUTION.license}
        </a>
        .
      </p>
    </aside>
  );
}

function LegendSwatch({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`size-2.5 rounded-[1px] ${className}`} />
      <span>{label}</span>
    </div>
  );
}
