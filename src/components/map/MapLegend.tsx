import { CSHAPES_ATTRIBUTION, SITE } from "@/data/site";

export function MapLegend() {
  return (
    <aside className="pointer-events-none absolute bottom-4 left-4 z-20 max-w-[240px] text-[10px] leading-relaxed text-muted md:bottom-6 md:left-6">
      <p className="pointer-events-auto">
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
