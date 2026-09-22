import { readFileSync } from "node:fs";
import path from "node:path";
import { movements as catalog } from "@/data/movements";
import { applyOverlays } from "@/lib/content-merge";
import type { MovementOverlay } from "@/lib/content-markdown";
import type { Movement, MovementSummary } from "@/types/movement";

function loadOverrides(): Record<string, MovementOverlay> {
  try {
    const file = path.join(process.cwd(), "src", "data", "content-overrides.json");
    return JSON.parse(readFileSync(file, "utf8")) as Record<string, MovementOverlay>;
  } catch {
    return {};
  }
}

export function toSummary(movement: Movement): MovementSummary {
  return {
    slug: movement.slug,
    mapFeatureIds: movement.mapFeatureIds,
    mapFeatureNames: movement.mapFeatureNames,
    currentCountryName: movement.currentCountryName,
    historicalCountryName: movement.historicalCountryName,
    title: movement.title,
    originalTitle: movement.originalTitle,
    fromYear: movement.fromYear,
    toYear: movement.toYear,
    type: movement.type,
    types: movement.types ?? [movement.type],
    shortDescription: movement.shortDescription,
  };
}

export function getAllMovements(): Movement[] {
  return applyOverlays(catalog, loadOverrides());
}

export function getMovement(slug: string): Movement | undefined {
  return getAllMovements().find((movement) => movement.slug === slug);
}

export function getMovementSummaries(): MovementSummary[] {
  return getAllMovements().map(toSummary);
}

export function getMovementByFeatureId(
  featureId: string,
): MovementSummary | undefined {
  const movement = getAllMovements().find((item) =>
    item.mapFeatureIds.includes(featureId),
  );
  return movement ? toSummary(movement) : undefined;
}

export function getFeatureIdToSlugMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const movement of getAllMovements()) {
    for (const id of movement.mapFeatureIds) {
      map[id] = movement.slug;
    }
  }
  return map;
}
