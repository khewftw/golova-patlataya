import type { Movement } from "@/types/movement";
import type { MovementOverlay } from "@/lib/content-markdown";

export function applyOverlays(
  base: Movement[],
  overlays: Record<string, MovementOverlay>,
): Movement[] {
  const bySlug = new Map(base.map((movement) => [movement.slug, movement]));

  for (const overlay of Object.values(overlays)) {
    const current = bySlug.get(overlay.slug);
    bySlug.set(overlay.slug, mergeMovement(current, overlay));
  }

  return [...bySlug.values()];
}

export function mergeMovement(base: Movement | undefined, overlay: MovementOverlay): Movement {
  if (!base) {
    return completeNewMovement(overlay);
  }

  const type = overlay.type ?? base.type;
  const storySections = resolveSectionImages(overlay.storySections ?? base.storySections, overlay.slug);
  const fields = { ...overlay };
  delete fields.gallery;

  return {
    ...base,
    ...defined(fields),
    slug: overlay.slug,
    type,
    types: overlay.types ?? (overlay.type ? [overlay.type] : base.types ?? [type]),
    storySections,
    gallery: base.gallery,
  };
}

function resolveSectionImages(sections: Movement["storySections"], slug: string) {
  return sections.map((section) => ({
    ...section,
    imageSrcs: section.imageSrcs?.map((src) => resolveMediaPath(src, slug)),
  }));
}

export function resolveMediaPath(src: string, slug: string) {
  if (src.startsWith("/media/")) return src;
  const file = src.replace(/^\.\//, "").split("/").filter(Boolean).at(-1);
  if (!file) return src;
  const stem = file.replace(/\.[^.]+$/, "");
  return `/media/movements/${slug}/${stem}.webp`;
}

function defined<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined),
  ) as Partial<T>;
}

function completeNewMovement(overlay: MovementOverlay): Movement {
  const missing = [
    "title",
    "originalTitle",
    "historicalCountryName",
    "currentCountryName",
    "location",
    "fromYear",
    "toYear",
    "type",
    "mapFeatureIds",
    "shortDescription",
    "intro",
  ].filter((key) => overlay[key as keyof MovementOverlay] == null);

  if (missing.length > 0) {
    throw new Error(
      `Новая история «${overlay.slug}» неполная. В шапке не хватает: ${missing.join(", ")}.`,
    );
  }

  const type = overlay.type!;
  return {
    slug: overlay.slug,
    mapFeatureIds: overlay.mapFeatureIds ?? [],
    mapFeatureNames: overlay.mapFeatureNames ?? [],
    currentCountryName: overlay.currentCountryName!,
    historicalCountryName: overlay.historicalCountryName!,
    title: overlay.title!,
    originalTitle: overlay.originalTitle!,
    alternativeNames: overlay.alternativeNames ?? [],
    fromYear: overlay.fromYear!,
    toYear: overlay.toYear!,
    type,
    types: overlay.types ?? [type],
    location: overlay.location!,
    contentStatus: overlay.contentStatus ?? "review",
    geographyNote: overlay.geographyNote,
    shortDescription: overlay.shortDescription!,
    intro: overlay.intro ?? "",
    timeline: overlay.timeline ?? [],
    facts: overlay.facts ?? [],
    storySections: resolveSectionImages(overlay.storySections ?? [], overlay.slug),
    gallery: [],
    sources: overlay.sources ?? [],
    tags: overlay.tags ?? [],
  };
}
