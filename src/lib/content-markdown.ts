import matter from "gray-matter";
import { stringify as stringifyYaml } from "yaml";
import {
  CONTENT_STATUSES,
  MOVEMENT_TYPES,
  type ContentStatus,
  type HistoricalSource,
  type Movement,
  type MovementFact,
  type MovementType,
  type StorySection,
  type TimelineEvent,
} from "@/types/movement";

export type MovementOverlay = Partial<Omit<Movement, "slug" | "gallery">> & {
  slug: string;
  gallery?: OverlayImage[];
};

export type OverlayImage = {
  file: string;
  alt?: string;
  caption?: string;
  year?: string;
  author?: string;
  license?: string;
  licenseUrl?: string;
  sourceUrl?: string;
};

const SOURCE_TYPES = ["encyclopedia", "archive", "book", "article", "museum", "official"] as const;

export function serializeMovementMarkdown(movement: Movement): string {
  const frontmatter = {
    slug: movement.slug,
    title: movement.title,
    originalTitle: movement.originalTitle,
    historicalCountryName: movement.historicalCountryName,
    currentCountryName: movement.currentCountryName,
    location: movement.location,
    fromYear: movement.fromYear,
    toYear: movement.toYear,
    type: movement.type,
    types: movement.types ?? [movement.type],
    mapFeatureIds: movement.mapFeatureIds,
    mapFeatureNames: movement.mapFeatureNames,
    alternativeNames: movement.alternativeNames,
    tags: movement.tags,
    contentStatus: movement.contentStatus,
    geographyNote: movement.geographyNote,
    shortDescription: movement.shortDescription,
    facts: movement.facts,
    timeline: movement.timeline,
    sources: movement.sources,
    gallery: movement.gallery.map((image) => ({
      file: fileNameFromSrc(image.src),
      alt: image.alt,
      caption: image.caption,
      year: image.year,
      author: image.author,
      license: image.license,
      licenseUrl: image.licenseUrl,
      sourceUrl: image.sourceUrl,
    })),
  };

  const yaml = stringifyYaml(stripUndefined(frontmatter), {
    lineWidth: 0,
    defaultStringType: "PLAIN",
    defaultKeyType: "PLAIN",
  }).trim();

  return `---\n${yaml}\n---\n\n${serializeBody(movement)}`;
}

export function parseMovementMarkdown(raw: string): {
  overlay: MovementOverlay;
  body: string;
} {
  const parsed = matter(raw);
  const data = asRecord(parsed.data);
  const slug = String(data.slug ?? "").trim();
  if (!slug) {
    throw new Error("В шапке файла нужен slug: например zazous или young-guard.");
  }

  const { intro, storySections, extraSources } = parseBody(parsed.content);
  const sources = readSources(data.sources);
  const type = readType(data.type);

  const overlay: MovementOverlay = {
    slug,
    title: readString(data.title),
    originalTitle: readString(data.originalTitle),
    historicalCountryName: readString(data.historicalCountryName),
    currentCountryName: readString(data.currentCountryName),
    location: readString(data.location),
    fromYear: readYear(data.fromYear),
    toYear: readYear(data.toYear),
    type,
    types: readTypes(data.types) ?? (type ? [type] : undefined),
    mapFeatureIds: readStringList(data.mapFeatureIds),
    mapFeatureNames: readStringList(data.mapFeatureNames),
    alternativeNames: readStringList(data.alternativeNames),
    tags: readStringList(data.tags),
    contentStatus: readStatus(data.contentStatus),
    geographyNote: readString(data.geographyNote),
    shortDescription: readString(data.shortDescription),
    intro: intro || undefined,
    facts: readFacts(data.facts),
    timeline: readTimeline(data.timeline),
    storySections: storySections.length > 0 ? storySections : undefined,
    sources: sources.length > 0 ? sources : extraSources.length > 0 ? extraSources : undefined,
    gallery: readGallery(data.gallery),
  };

  return { overlay, body: parsed.content };
}

export function fileNameFromSrc(src: string) {
  return src.split("/").filter(Boolean).at(-1) ?? src;
}

function serializeBody(movement: Movement) {
  const blocks = [movement.intro.trim(), ""];
  for (const section of movement.storySections) {
    blocks.push(`## ${section.heading}`, "", section.body.trim(), "");
    for (const src of section.imageSrcs ?? []) {
      const image = movement.gallery.find((item) => item.src === src);
      blocks.push(`![${image?.alt || image?.caption || ""}](${fileNameFromSrc(src)})`, "");
    }
  }
  return `${blocks.join("\n").trim()}\n`;
}

function parseBody(markdown: string) {
  const text = markdown.replace(/\r\n/g, "\n").trim();
  if (!text) {
    return { intro: "", storySections: [] as StorySection[], extraSources: [] as HistoricalSource[] };
  }

  const chunks = text.split(/^##\s+/m);
  const intro = stripImages(chunks[0] ?? "").trim();
  const storySections: StorySection[] = [];
  const extraSources: HistoricalSource[] = [];

  for (const chunk of chunks.slice(1)) {
    const newline = chunk.indexOf("\n");
    const heading = (newline === -1 ? chunk : chunk.slice(0, newline)).trim();
    const raw = (newline === -1 ? "" : chunk.slice(newline + 1)).trim();
    if (!heading) continue;

    if (heading.toLowerCase() === "источники") {
      extraSources.push(...parseSourceList(raw));
      continue;
    }

    const imageSrcs = [...raw.matchAll(/!\[[^\]]*]\(([^)]+)\)/g)].map((match) =>
      match[1].trim().replace(/^\.\//, ""),
    );
    const body = stripImages(raw).trim();
    storySections.push({
      heading,
      body,
      ...(imageSrcs.length > 0 ? { imageSrcs } : {}),
    });
  }

  return { intro, storySections, extraSources };
}

function parseSourceList(raw: string): HistoricalSource[] {
  const sources: HistoricalSource[] = [];
  for (const line of raw.split("\n")) {
    const match = line.match(/\[([^\]]+)]\(([^)]+)\)(?:\s*[—–-]\s*(.+))?/);
    if (!match) continue;
    sources.push({
      title: match[1].trim(),
      url: match[2].trim(),
      publisher: (match[3] ?? "источник").trim(),
      type: "article",
    });
  }
  return sources;
}

function stripImages(text: string) {
  return text.replace(/!\[[^\]]*]\([^)]+\)/g, "").replace(/\n{3,}/g, "\n\n");
}

function readString(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function readYear(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return undefined;
}

function readType(value: unknown): MovementType | undefined {
  return isType(value) ? value : undefined;
}

function readTypes(value: unknown): MovementType[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const types = value.filter(isType);
  return types.length > 0 ? types : undefined;
}

function isType(value: unknown): value is MovementType {
  return typeof value === "string" && (MOVEMENT_TYPES as readonly string[]).includes(value);
}

function readStatus(value: unknown): ContentStatus | undefined {
  return typeof value === "string" && (CONTENT_STATUSES as readonly string[]).includes(value)
    ? (value as ContentStatus)
    : undefined;
}

function readStringList(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  const items = value.map((item) => String(item).trim()).filter(Boolean);
  return items.length > 0 ? items : undefined;
}

function readFacts(value: unknown): MovementFact[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const facts = value.flatMap((item) => {
    const record = asRecord(item);
    const label = readString(record.label);
    const factValue = readString(record.value);
    return label && factValue ? [{ label, value: factValue }] : [];
  });
  return facts.length > 0 ? facts : undefined;
}

function readTimeline(value: unknown): TimelineEvent[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const events = value.flatMap((item) => {
    const record = asRecord(item);
    const year = readString(record.year) ?? (record.year != null ? String(record.year) : undefined);
    const title = readString(record.title);
    const text = readString(record.text);
    return year && title && text ? [{ year, title, text }] : [];
  });
  return events.length > 0 ? events : undefined;
}

function readSources(value: unknown): HistoricalSource[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const record = asRecord(item);
    const title = readString(record.title);
    const url = readString(record.url);
    const publisher = readString(record.publisher);
    const type = SOURCE_TYPES.find((entry) => entry === record.type);
    return title && url && publisher && type ? [{ title, url, publisher, type }] : [];
  });
}

function readGallery(value: unknown): OverlayImage[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const images = value.flatMap((item) => {
    const record = asRecord(item);
    const file = readString(record.file) ?? readString(record.src);
    if (!file) return [];
    return [
      {
        file: file.replace(/^\.\//, ""),
        alt: readString(record.alt),
        caption: readString(record.caption),
        year: readString(record.year),
        author: readString(record.author),
        license: readString(record.license),
        licenseUrl: readString(record.licenseUrl),
        sourceUrl: readString(record.sourceUrl),
      },
    ];
  });
  return images.length > 0 ? images : undefined;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefined(item)) as T;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).flatMap(([key, item]) => {
      if (item === undefined) return [];
      return [[key, stripUndefined(item)] as const];
    });
    return Object.fromEntries(entries) as T;
  }
  return value;
}
