import { americasAfricaMovements } from "@/data/movements/americas-africa";
import { asiaPacificMovements } from "@/data/movements/asia-pacific";
import { europeMovements } from "@/data/movements/europe";
import mediaManifest from "@/data/media-manifest.json";
import type { HistoricalImage, Movement } from "@/types/movement";

const baseMovements: Movement[] = [
  ...europeMovements,
  ...americasAfricaMovements,
  ...asiaPacificMovements,
];

type ManifestEntry = {
  images: HistoricalImage[];
};

const manifest = mediaManifest as Record<string, ManifestEntry>;

export const movements: Movement[] = baseMovements.map((movement) => ({
  ...movement,
  types: movement.types ?? [movement.type],
  gallery: manifest[movement.slug]?.images ?? movement.gallery,
}));
