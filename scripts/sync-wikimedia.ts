/**
 * Download archival images from Wikimedia Commons into public/media.
 * Runtime of the site does not call Wikipedia or Commons.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { MEDIA_QUERIES } from "../src/data/media-queries";
import type { HistoricalImage } from "../src/types/movement";

const ROOT = process.cwd();
const OUT_MANIFEST = path.join(ROOT, "src/data/media-manifest.json");
const MEDIA_ROOT = path.join(ROOT, "public/media/movements");
const API = "https://commons.wikimedia.org/w/api.php";
const UA = "ksenia-map/1.0 (historical atlas; local preprocessing; educational non-commercial)";
const MAX_PER_SLUG = 4;

type ImageInfo = {
  url?: string;
  thumburl?: string;
  mime?: string;
  size?: number;
  extmetadata?: Record<string, { value?: string }>;
};

type Page = {
  title?: string;
  imageinfo?: ImageInfo[];
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function api(params: Record<string, string>): Promise<unknown> {
  const url = new URL(API);
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  for (let attempt = 1; attempt <= 6; attempt += 1) {
    const response = await fetch(url, { headers: { "User-Agent": UA } });
    if (response.ok) return response.json();
    if (response.status === 429 || response.status >= 500) {
      await sleep(attempt * 2500);
      continue;
    }
    throw new Error(`Commons API ${response.status} for ${url}`);
  }
  throw new Error(`Commons API failed for ${url}`);
}

function decodeHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function licenseOk(license: string) {
  const value = license.toLowerCase();
  return (
    value.includes("public domain") ||
    value.includes("pd") ||
    value.includes("cc0") ||
    value.includes("cc by") ||
    value.includes("creative commons")
  );
}

function fromPage(page: Page): HistoricalImage | null {
  const info = page.imageinfo?.[0];
  if (!info || !page.title) return null;
  const meta = info.extmetadata ?? {};
  const license = decodeHtml(meta.LicenseShortName?.value || meta.License?.value || "");
  const artist = decodeHtml(meta.Artist?.value || "");
  const description = decodeHtml(meta.ImageDescription?.value || page.title);
  const date = decodeHtml(meta.DateTimeOriginal?.value || meta.DateTime?.value || "");
  if (license && !licenseOk(license)) return null;

  const sourceUrl = `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title.replaceAll(" ", "_"))}`;
  return {
    src: "",
    alt: description.slice(0, 180) || page.title,
    caption: description.slice(0, 240) || page.title,
    year: date ? date.slice(0, 10) : undefined,
    author: artist || "Wikimedia Commons",
    license: license || "см. страницу файла",
    licenseUrl: meta.LicenseUrl?.value,
    sourceUrl,
  };
}

async function queryTitles(titles: string[]): Promise<Page[]> {
  if (titles.length === 0) return [];
  const data = (await api({
    action: "query",
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: "1600",
    titles: titles.map((title) => (title.startsWith("File:") ? title : `File:${title}`)).join("|"),
  })) as { query?: { pages?: Record<string, Page> } };
  return Object.values(data.query?.pages ?? {}).filter((page) => page.imageinfo);
}

async function queryCategory(category: string): Promise<Page[]> {
  const data = (await api({
    action: "query",
    generator: "categorymembers",
    gcmtitle: category.startsWith("Category:") ? category : `Category:${category}`,
    gcmtype: "file",
    gcmlimit: "12",
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: "1600",
  })) as { query?: { pages?: Record<string, Page> } };
  return Object.values(data.query?.pages ?? {}).filter((page) => page.imageinfo);
}

async function querySearch(search: string): Promise<Page[]> {
  const data = (await api({
    action: "query",
    generator: "search",
    gsrsearch: search,
    gsrnamespace: "6",
    gsrlimit: "8",
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: "1600",
  })) as { query?: { pages?: Record<string, Page> } };
  return Object.values(data.query?.pages ?? {}).filter((page) => page.imageinfo);
}

function pickUrl(info: ImageInfo) {
  return info.thumburl || info.url;
}

async function downloadImage(url: string, destBase: string): Promise<string> {
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    const response = await fetch(url, { headers: { "User-Agent": UA } });
    if (response.ok) {
      const buffer = Buffer.from(await response.arrayBuffer());
      const dest = `${destBase}.webp`;
      await sharp(buffer)
        .rotate()
        .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(dest);
      return dest;
    }
    lastError = new Error(`Download failed ${response.status}`);
    if (response.status === 429 || response.status >= 500) {
      await sleep(attempt * 2000);
      continue;
    }
    throw lastError;
  }
  throw lastError ?? new Error("Download failed");
}

async function collectPages(query: (typeof MEDIA_QUERIES)[number]): Promise<Page[]> {
  const seen = new Set<string>();
  const pages: Page[] = [];

  const add = (incoming: Page[]) => {
    for (const page of incoming) {
      const title = page.title;
      if (!title || seen.has(title)) continue;
      if (/\.(djvu|pdf|webm|ogv|svg)$/i.test(title) && !query.files?.some((file) => title.endsWith(file))) {
        continue;
      }
      if (!page.imageinfo?.[0]?.mime?.startsWith("image/")) continue;
      seen.add(title);
      pages.push(page);
    }
  };

  if (query.files?.length) add(await queryTitles(query.files));
  for (const category of query.categories ?? []) {
    add(await queryCategory(category));
    await sleep(200);
  }
  for (const search of query.searches) {
    if (pages.length >= MAX_PER_SLUG * 2) break;
    add(await querySearch(search));
    await sleep(250);
  }
  return pages;
}

async function syncSlug(query: (typeof MEDIA_QUERIES)[number]) {
  const pages = await collectPages(query);
  const dir = path.join(MEDIA_ROOT, query.slug);
  await mkdir(dir, { recursive: true });

  const images: HistoricalImage[] = [];
  let index = 0;
  for (const page of pages) {
    if (images.length >= MAX_PER_SLUG) break;
    const prepared = fromPage(page);
    const info = page.imageinfo?.[0];
    const url = info ? pickUrl(info) : null;
    if (!prepared || !url) continue;
    try {
      const filename = index === 0 ? "hero" : `0${index}`;
      const dest = await downloadImage(url, path.join(dir, filename));
      const publicPath = `/media/movements/${query.slug}/${path.basename(dest)}`;
      images.push({ ...prepared, src: publicPath });
      index += 1;
      console.log(`  ${query.slug}: ${publicPath}`);
    } catch (error) {
      console.warn(`  skip ${page.title}:`, error);
    }
  }
  return images;
}

async function main() {
  let manifest: Record<string, { images: HistoricalImage[] }> = {};
  try {
    manifest = JSON.parse(await readFile(OUT_MANIFEST, "utf8")) as Record<
      string,
      { images: HistoricalImage[] }
    >;
  } catch {
    manifest = {};
  }

  const only = process.argv
    .find((arg) => arg.startsWith("--only="))
    ?.slice(7)
    .split(",")
    .filter(Boolean);

  await mkdir(MEDIA_ROOT, { recursive: true });
  const queries = only
    ? MEDIA_QUERIES.filter((query) => only.includes(query.slug))
    : MEDIA_QUERIES;

  for (const query of queries) {
    if ((manifest[query.slug]?.images.length ?? 0) > 0 && only === undefined) {
      console.log(`Keep ${query.slug} (${manifest[query.slug].images.length})`);
      continue;
    }
    console.log(`Sync ${query.slug}`);
    try {
      const images = await syncSlug(query);
      manifest[query.slug] = { images };
      if (images.length === 0) {
        console.warn(`  no images for ${query.slug}`);
      }
    } catch (error) {
      console.warn(`  failed ${query.slug}:`, error);
      manifest[query.slug] ??= { images: [] };
    }
    await sleep(800);
  }

  await writeFile(OUT_MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Wrote ${OUT_MANIFEST}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
