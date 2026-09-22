import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { parseMovementMarkdown, serializeMovementMarkdown } from "@/lib/content-markdown";
import type { MovementOverlay, OverlayImage } from "@/lib/content-markdown";
import { resolveMediaPath } from "@/lib/content-merge";
import type { HistoricalImage } from "@/types/movement";

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content", "movements");
const OVERRIDES_PATH = path.join(ROOT, "src", "data", "content-overrides.json");
const MANIFEST_PATH = path.join(ROOT, "src", "data", "media-manifest.json");
const MEDIA_ROOT = path.join(ROOT, "public", "media", "movements");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".tif", ".tiff", ".svg"]);

export type UploadedImage = {
  filename: string;
  buffer: Buffer;
};

export async function writeMovementMarkdown(slug: string, markdown: string) {
  await mkdir(CONTENT_DIR, { recursive: true });
  const dest = path.join(CONTENT_DIR, `${safeSlug(slug)}.md`);
  await writeFile(dest, markdown.endsWith("\n") ? markdown : `${markdown}\n`);
  return dest;
}

export async function applyMovementMarkdown(options: {
  markdown: string;
  uploads?: UploadedImage[];
}) {
  const { overlay } = parseMovementMarkdown(options.markdown);
  const slug = safeSlug(overlay.slug);
  overlay.slug = slug;

  await writeMovementMarkdown(slug, options.markdown);
  await saveSidecarUploads(slug, options.uploads ?? []);
  const gallery = await materializeGallery(slug, overlay.gallery ?? [], options.uploads ?? []);
  const nextOverlay = toStoredOverlay(overlay, slug);

  await writeOverride(slug, nextOverlay);
  if (gallery.length > 0) {
    await writeManifestGallery(slug, gallery);
  }

  return { slug, images: gallery.length, overlay: nextOverlay };
}

export async function applyContentFolder() {
  await mkdir(CONTENT_DIR, { recursive: true });
  const files = (await readdir(CONTENT_DIR)).filter(
    (name) => name.endsWith(".md") && !name.startsWith("_"),
  );
  const applied: string[] = [];
  for (const file of files) {
    const markdown = await readFile(path.join(CONTENT_DIR, file), "utf8");
    const result = await applyMovementMarkdown({ markdown });
    applied.push(result.slug);
  }
  return applied;
}

export async function exportMovementMarkdown(movement: Parameters<typeof serializeMovementMarkdown>[0]) {
  const markdown = serializeMovementMarkdown(movement);
  await writeMovementMarkdown(movement.slug, markdown);
  return markdown;
}

async function materializeGallery(
  slug: string,
  listed: OverlayImage[],
  uploads: UploadedImage[],
) {
  const uploadByName = new Map(uploads.map((file) => [normalizeName(file.filename), file]));
  const images: HistoricalImage[] = [];
  const seen = new Set<string>();

  const queue = [...listed];
  for (const upload of uploads) {
    const name = path.basename(upload.filename);
    if (!queue.some((item) => sameFile(item.file, name))) {
      queue.push({
        file: name,
        caption: stem(name),
        alt: stem(name),
        author: "загружено вручную",
        license: "уточнить",
        sourceUrl: `/media/movements/${slug}/${stem(name)}.webp`,
      });
    }
  }

  for (const item of queue) {
    const publicSrc = await ensurePublicImage(slug, item.file, uploadByName);
    if (!publicSrc || seen.has(publicSrc)) continue;
    seen.add(publicSrc);
    images.push({
      src: publicSrc,
      alt: item.alt || item.caption || stem(item.file),
      caption: item.caption || item.alt || stem(item.file),
      year: item.year,
      author: item.author,
      license: item.license,
      licenseUrl: item.licenseUrl,
      sourceUrl: item.sourceUrl || publicSrc,
    });
  }

  return images;
}

async function ensurePublicImage(
  slug: string,
  file: string,
  uploads: Map<string, UploadedImage>,
) {
  if (file.startsWith("/media/")) return file;

  const base = path.basename(file);
  const publicExisting = path.join(MEDIA_ROOT, slug, base);
  const contentExisting = path.join(CONTENT_DIR, slug, base);
  const upload = uploads.get(normalizeName(base));
  const destName = `${stem(base)}.webp`;
  const dest = path.join(MEDIA_ROOT, slug, destName);
  const publicSrc = `/media/movements/${slug}/${destName}`;

  if (upload) {
    await mkdir(path.dirname(dest), { recursive: true });
    await writeWebp(upload.buffer, dest);
    return publicSrc;
  }

  const fromContent = await readIfExists(contentExisting);
  if (fromContent) {
    await mkdir(path.dirname(dest), { recursive: true });
    await writeWebp(fromContent, dest);
    return publicSrc;
  }

  const alreadyPublic = await readIfExists(publicExisting);
  if (alreadyPublic) return `/media/movements/${slug}/${base}`;

  const alreadyWebp = await readIfExists(dest);
  if (alreadyWebp) return publicSrc;

  return resolveMediaPath(file, slug);
}

async function saveSidecarUploads(slug: string, uploads: UploadedImage[]) {
  if (uploads.length === 0) return;
  const dir = path.join(CONTENT_DIR, slug);
  await mkdir(dir, { recursive: true });
  for (const upload of uploads) {
    const name = safeFileName(upload.filename);
    if (!IMAGE_EXT.has(path.extname(name).toLowerCase())) continue;
    await writeFile(path.join(dir, name), upload.buffer);
  }
}

async function writeWebp(buffer: Buffer, dest: string) {
  await sharp(buffer)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(dest);
}

async function writeOverride(slug: string, overlay: MovementOverlay) {
  const current = await readJson<Record<string, MovementOverlay>>(OVERRIDES_PATH, {});
  current[slug] = overlay;
  await writeFile(OVERRIDES_PATH, `${JSON.stringify(current, null, 2)}\n`);
}

async function writeManifestGallery(slug: string, images: HistoricalImage[]) {
  const manifest = await readJson<Record<string, { images: HistoricalImage[] }>>(MANIFEST_PATH, {});
  manifest[slug] = { images };
  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
}

function toStoredOverlay(overlay: MovementOverlay, slug: string): MovementOverlay {
  const rest = { ...overlay };
  delete rest.gallery;
  return {
    ...rest,
    slug,
    storySections: overlay.storySections?.map((section) => ({
      ...section,
      imageSrcs: section.imageSrcs?.map((src) => resolveMediaPath(src, slug)),
    })),
  };
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function readIfExists(file: string) {
  try {
    return await readFile(file);
  } catch {
    return null;
  }
}

function safeSlug(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (!slug) throw new Error("Некорректный slug.");
  return slug;
}

function safeFileName(name: string) {
  const base = path.basename(name).replace(/[^a-zA-Z0-9._-]/g, "-");
  if (!base || base.startsWith(".")) throw new Error(`Плохое имя файла: ${name}`);
  return base;
}

function normalizeName(name: string) {
  return path.basename(name).toLowerCase();
}

function sameFile(a: string, b: string) {
  return normalizeName(a) === normalizeName(b) || stem(a).toLowerCase() === stem(b).toLowerCase();
}

function stem(name: string) {
  return path.basename(name).replace(/\.[^.]+$/, "");
}
