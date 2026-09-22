import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";
import { geoArea } from "d3-geo";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";

export type MapCountryProperties = {
  fid?: number;
  name?: string;
  capname?: string;
  gwsdate?: string;
  gwedate?: string;
};

export type MapCountryFeature = Feature<
  Polygon | MultiPolygon,
  MapCountryProperties
> & { id: string };

type WorldObjects = {
  world: GeometryCollection<MapCountryProperties>;
};

function rewindGeometry(geometry: Polygon | MultiPolygon): Polygon | MultiPolygon {
  const rewindPolygon = (rings: number[][][]) => {
    const polygon: Polygon = { type: "Polygon", coordinates: rings };
    if (geoArea(polygon) <= Math.PI) return rings;
    return rings.map((ring) => [...ring].reverse());
  };

  if (geometry.type === "Polygon") {
    return { type: "Polygon", coordinates: rewindPolygon(geometry.coordinates) };
  }
  return {
    type: "MultiPolygon",
    coordinates: geometry.coordinates.map(rewindPolygon),
  };
}

export async function loadWorldCountries(): Promise<{
  countries: MapCountryFeature[];
  collection: FeatureCollection<Polygon | MultiPolygon, MapCountryProperties>;
}> {
  const response = await fetch("/maps/world-1950.topo.json");
  if (!response.ok) {
    throw new Error("Не удалось загрузить карту 1950 года");
  }

  const topology = (await response.json()) as Topology<WorldObjects>;
  const collection = feature(
    topology,
    topology.objects.world,
  ) as FeatureCollection<Polygon | MultiPolygon, MapCountryProperties>;

  const countries = collection.features.map((item) => ({
    ...item,
    id: String(item.id),
    geometry: rewindGeometry(item.geometry),
  }));

  return {
    countries,
    collection: { type: "FeatureCollection", features: countries },
  };
}
