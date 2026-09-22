/**
 * Build a compact 1950-01-01 world map from CShapes 2.0.
 *
 * Source: Schvitz et al. (2022), CShapes 2.0, ETH Zurich / ICR.
 * License: CC BY-NC-SA.
 *
 * Primary: CShapes OGC API (ldproxy demo).
 * Fallback: official GeoJSON download URLs, then local cache.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { geoArea } from "d3-geo";
import { quantize } from "topojson-client";
import { topology } from "topojson-server";
import { presimplify, quantile, simplify } from "topojson-simplify";
import type { Feature, FeatureCollection, Geometry, MultiPolygon, Polygon } from "geojson";
import type { GeometryCollection, Objects, Topology } from "topojson-specification";

const SNAPSHOT = "1950-01-01";
const SNAPSHOT_ISO = `${SNAPSHOT}T00:00:00Z`;
const ROOT = process.cwd();
const CACHE_DIR = path.join(ROOT, ".cache");
const RAW_CACHE = path.join(CACHE_DIR, `cshapes-${SNAPSHOT}.geo.json`);
const OUT_TOPO = path.join(ROOT, "public/maps/world-1950.topo.json");
const OUT_INDEX = path.join(ROOT, "src/data/map-feature-index.json");

const OGC_ITEMS =
  "https://demo.ldproxy.net/cshapes/collections/boundary/items";

const FALLBACK_GEOJSON_URLS = [
  "https://icr.ethz.ch/data/cshapes/CShapes-2.0.geojson",
  "https://icr.ethz.ch/data/cshapes/data/CShapes-2.0.geojson",
  "https://hdl.loc.gov/loc.gdc/gdcdatasets.2023592015-geojson",
];

type CShapesProps = {
  fid?: number;
  name?: string;
  cntry_name?: string;
  country?: string;
  gwcode?: number;
  cowcode?: number;
  area?: number;
  area_km2?: number;
  capname?: string;
  caplong?: number;
  caplat?: number;
  gwsdate?: string;
  gwedate?: string;
  start?: string;
  end?: string;
  [key: string]: unknown;
};

type MapFeature = Feature<Polygon | MultiPolygon, CShapesProps>;

type FeatureIndexEntry = {
  id: string;
  fid: number | null;
  name: string;
  gwcode: number | null;
  capname: string | null;
  gwsdate: string | null;
  gwedate: string | null;
};

type FeatureIndex = {
  snapshot: string;
  source: string;
  license: string;
  citation: string;
  generatedAt: string;
  featureCount: number;
  features: FeatureIndexEntry[];
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url: string, attempt = 1): Promise<unknown> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/geo+json, application/json",
      "User-Agent": "ksenia-map/1.0 (historical atlas; local preprocessing)",
    },
  });

  if (!response.ok) {
    if (attempt < 5 && (response.status === 429 || response.status >= 500)) {
      await sleep(attempt * 1500);
      return fetchJson(url, attempt + 1);
    }
    throw new Error(`HTTP ${response.status} for ${url}`);
  }

  return response.json();
}

function asFeatureCollection(value: unknown): FeatureCollection {
  if (
    value &&
    typeof value === "object" &&
    "type" in value &&
    value.type === "FeatureCollection" &&
    "features" in value &&
    Array.isArray(value.features)
  ) {
    return value as FeatureCollection;
  }
  throw new Error("Response is not a GeoJSON FeatureCollection");
}

function nextLink(payload: Record<string, unknown>): string | null {
  const links = payload.links;
  if (!Array.isArray(links)) return null;
  const next = links.find(
    (link) =>
      link &&
      typeof link === "object" &&
      "rel" in link &&
      link.rel === "next" &&
      "href" in link &&
      typeof link.href === "string",
  );
  return next && typeof next === "object" && "href" in next
    ? String(next.href)
    : null;
}

async function fetchFromOgcApi(): Promise<FeatureCollection> {
  const features: Feature[] = [];
  let url: string | null =
    `${OGC_ITEMS}?datetime=${encodeURIComponent(SNAPSHOT_ISO)}&limit=20&f=json`;
  let pages = 0;

  while (url) {
    pages += 1;
    console.log(`Fetching OGC page ${pages}: ${url}`);
    const payload = (await fetchJson(url)) as Record<string, unknown>;
    const collection = asFeatureCollection(payload);
    features.push(...collection.features);
    console.log(
      `  +${collection.features.length} (total ${features.length}${
        typeof payload.numberMatched === "number"
          ? ` / ${payload.numberMatched}`
          : ""
      })`,
    );
    url = nextLink(payload);
    if (url) await sleep(250);
  }

  if (features.length === 0) {
    throw new Error("OGC API returned no features");
  }

  return { type: "FeatureCollection", features };
}

function parseDate(value: unknown): Date | null {
  if (typeof value !== "string" || !value) return null;
  const normalized = value.length === 10 ? `${value}T00:00:00Z` : value;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isValidOnSnapshot(props: CShapesProps, snapshot: Date): boolean {
  const start =
    parseDate(props.gwsdate) ??
    parseDate(props.start) ??
    parseDate(props.startdate);
  const end =
    parseDate(props.gwedate) ?? parseDate(props.end) ?? parseDate(props.enddate);

  if (start && snapshot < start) return false;
  if (end && snapshot > end) return false;
  return true;
}

function featureName(props: CShapesProps): string {
  return (
    (typeof props.name === "string" && props.name) ||
    (typeof props.cntry_name === "string" && props.cntry_name) ||
    (typeof props.country === "string" && props.country) ||
    "Unknown"
  );
}

function inspectFields(features: Feature[]) {
  const keys = new Set<string>();
  for (const feature of features.slice(0, 40)) {
    if (feature.properties && typeof feature.properties === "object") {
      for (const key of Object.keys(feature.properties)) keys.add(key);
    }
  }
  console.log("Observed property fields:", [...keys].sort().join(", "));
}

function keepGeometry(geometry: Geometry | null): geometry is Polygon | MultiPolygon {
  return geometry?.type === "Polygon" || geometry?.type === "MultiPolygon";
}

function rewindPolygon(rings: number[][][]) {
  const polygon: Polygon = { type: "Polygon", coordinates: rings };
  if (geoArea(polygon) <= Math.PI) return rings;
  return rings.map((ring) => [...ring].reverse());
}

function rewindGeometry(geometry: Polygon | MultiPolygon): Polygon | MultiPolygon {
  if (geometry.type === "Polygon") {
    return { type: "Polygon", coordinates: rewindPolygon(geometry.coordinates) };
  }
  return {
    type: "MultiPolygon",
    coordinates: geometry.coordinates.map(rewindPolygon),
  };
}

function stripEmptyRings(geometry: Polygon | MultiPolygon): Polygon | MultiPolygon | null {
  if (geometry.type === "Polygon") {
    const rings = geometry.coordinates.filter((ring) => ring.length >= 4);
    if (rings.length === 0) return null;
    return { type: "Polygon", coordinates: rings };
  }

  const polygons = geometry.coordinates
    .map((polygon) => polygon.filter((ring) => ring.length >= 4))
    .filter((polygon) => polygon.length > 0);

  if (polygons.length === 0) return null;
  return { type: "MultiPolygon", coordinates: polygons };
}

function cleanFeatures(collection: FeatureCollection, snapshot: Date): MapFeature[] {
  const cleaned: MapFeature[] = [];

  for (const feature of collection.features) {
    const props = (feature.properties ?? {}) as CShapesProps;
    if (!isValidOnSnapshot(props, snapshot)) continue;
    if (!keepGeometry(feature.geometry)) continue;

    const stripped = stripEmptyRings(feature.geometry);
    if (!stripped) continue;
    const geometry = rewindGeometry(stripped);

    const fid = typeof props.fid === "number" ? props.fid : null;
    const id =
      feature.id !== undefined && feature.id !== null
        ? String(feature.id)
        : fid !== null
          ? String(fid)
          : featureName(props);

    cleaned.push({
      type: "Feature",
      id,
      geometry,
      properties: {
        fid: fid ?? undefined,
        name: featureName(props),
        gwcode: typeof props.gwcode === "number" ? props.gwcode : undefined,
        capname: typeof props.capname === "string" ? props.capname : undefined,
        gwsdate:
          typeof props.gwsdate === "string"
            ? props.gwsdate
            : typeof props.start === "string"
              ? props.start
              : undefined,
        gwedate:
          typeof props.gwedate === "string"
            ? props.gwedate
            : typeof props.end === "string"
              ? props.end
              : undefined,
      },
    });
  }

  return cleaned;
}

function buildIndex(features: MapFeature[]): FeatureIndex {
  const entries = features
    .map((feature) => {
      const props = feature.properties;
      return {
        id: String(feature.id),
        fid: typeof props.fid === "number" ? props.fid : null,
        name: featureName(props),
        gwcode: typeof props.gwcode === "number" ? props.gwcode : null,
        capname: typeof props.capname === "string" ? props.capname : null,
        gwsdate: typeof props.gwsdate === "string" ? props.gwsdate : null,
        gwedate: typeof props.gwedate === "string" ? props.gwedate : null,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "en"));

  return {
    snapshot: SNAPSHOT,
    source: "CShapes 2.0 via OGC API / ETH Zurich International Conflict Research",
    license: "CC BY-NC-SA",
    citation:
      "Schvitz, Guy, Seraina Rüegger, Luc Girardin, Lars-Erik Cederman, Nils Weidmann, and Kristian Skrede Gleditsch. 2022. “Mapping the International System, 1886–2019: The CShapes 2.0 Dataset.” Journal of Conflict Resolution 66(1): 144–161.",
    generatedAt: new Date().toISOString(),
    featureCount: entries.length,
    features: entries,
  };
}

function toTopology(features: MapFeature[]): Topology<Objects<CShapesProps>> {
  const geojson: FeatureCollection<Polygon | MultiPolygon, CShapesProps> = {
    type: "FeatureCollection",
    features,
  };

  const raw = topology({ world: geojson }) as Topology<
    Objects<CShapesProps>
  >;
  const prepared = presimplify(raw);
  // Conservative: keep most vertices so islands and narrow states survive.
  const minWeight = quantile(prepared, 0.18);
  const simplified = simplify(prepared, minWeight);
  return quantize(simplified, 1e5);
}

async function loadRawCollection(): Promise<FeatureCollection> {
  try {
    const cached = await readFile(RAW_CACHE, "utf8");
    console.log(`Using cached GeoJSON at ${RAW_CACHE}`);
    return asFeatureCollection(JSON.parse(cached));
  } catch {
    // continue
  }

  try {
    const fromApi = await fetchFromOgcApi();
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(RAW_CACHE, JSON.stringify(fromApi));
    return fromApi;
  } catch (error) {
    console.warn("OGC API failed, trying official GeoJSON downloads:", error);
  }

  for (const url of FALLBACK_GEOJSON_URLS) {
    try {
      console.log(`Trying fallback ${url}`);
      const payload = await fetchJson(url);
      const collection = asFeatureCollection(payload);
      await mkdir(CACHE_DIR, { recursive: true });
      await writeFile(RAW_CACHE, JSON.stringify(collection));
      return collection;
    } catch (error) {
      console.warn(`Fallback failed for ${url}:`, error);
    }
  }

  throw new Error("Could not retrieve CShapes data from API or fallback URLs");
}

async function main() {
  const snapshot = new Date(`${SNAPSHOT}T00:00:00Z`);
  const raw = await loadRawCollection();
  console.log(`Raw features: ${raw.features.length}`);
  inspectFields(raw.features);

  const features = cleanFeatures(raw, snapshot);
  console.log(`Features valid on ${SNAPSHOT}: ${features.length}`);

  if (features.length < 50) {
    throw new Error(
      `Unexpectedly few features after filtering (${features.length}). Aborting.`,
    );
  }

  const topo = toTopology(features);
  const world = topo.objects.world as GeometryCollection<CShapesProps>;
  console.log(`TopoJSON geometries: ${world.geometries.length}`);

  const index = buildIndex(features);

  await mkdir(path.dirname(OUT_TOPO), { recursive: true });
  await mkdir(path.dirname(OUT_INDEX), { recursive: true });
  await writeFile(OUT_TOPO, JSON.stringify(topo));
  await writeFile(OUT_INDEX, `${JSON.stringify(index, null, 2)}\n`);

  const topoBytes = Buffer.byteLength(JSON.stringify(topo));
  console.log(`Wrote ${OUT_TOPO} (${(topoBytes / 1024).toFixed(1)} KB)`);
  console.log(`Wrote ${OUT_INDEX} (${index.featureCount} features)`);
  console.log("Sample names:");
  for (const entry of index.features.slice(0, 25)) {
    console.log(`  ${entry.id}\t${entry.name}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
