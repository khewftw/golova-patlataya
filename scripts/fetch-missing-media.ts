import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { HistoricalImage } from "../src/types/movement";

const ROOT = process.cwd();
const OUT_MANIFEST = path.join(ROOT, "src/data/media-manifest.json");
const UA = "ksenia-map/1.0 (historical atlas; local preprocessing)";

const TARGETS: Array<{
  slug: string;
  file: string;
  caption: string;
  year?: string;
  author?: string;
  license: string;
}> = [
  {
    slug: "juventude-brasileira",
    file: "Getúlio Vargas - 1930.jpg",
    caption:
      "Жетулиу Варгас, 1930 год. Государственный контекст Estado Novo, в котором в 1940 году появилась Juventude Brasileira.",
    year: "1930",
    license: "Public domain",
  },
  {
    slug: "anc-youth-league",
    file: "Young Mandela.jpg",
    caption:
      "Нельсон Мандела в молодости. Один из основателей ANC Youth League (1944).",
    license: "Public domain",
  },
  {
    slug: "vanguard-youth",
    file: "Viet Minh during August Revolution.jpg",
    caption: "Вьетминь во время Августовской революции 1945 года.",
    year: "1945",
    license: "Public domain",
  },
  {
    slug: "vanguard-youth",
    file: "Ba Dinh Square September 2nd, 1945.jpg",
    caption: "Площадь Бадинь, 2 сентября 1945 года.",
    year: "1945",
    license: "Public domain",
  },
  {
    slug: "korean-national-youth",
    file: "Rhee Syng-Man in 1948.jpg",
    caption:
      "Ли Сынман, 1948 год. Политический контекст ранней Республики Корея, где действовала 조선민족청년단.",
    year: "1948",
    license: "Public domain",
  },
  {
    slug: "canadian-youth-congress",
    file: "University of Toronto students drill 1914.jpg",
    caption:
      "Студенты Университета Торонто на учебных сборах. Кадр более ранний, чем CYC; оставлен как визуальный якорь студенческой среды Канады.",
    year: "1914",
    license: "Public domain",
  },
];

async function download(file: string) {
  const encoded = encodeURIComponent(file.replaceAll(" ", "_"));
  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encoded}?width=1600`;
  const response = await fetch(url, {
    headers: { "User-Agent": UA },
    redirect: "follow",
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${file}`);
  return Buffer.from(await response.arrayBuffer());
}

async function main() {
  const manifest = JSON.parse(await readFile(OUT_MANIFEST, "utf8")) as Record<
    string,
    { images: HistoricalImage[] }
  >;

  for (const target of TARGETS) {
    const existing = manifest[target.slug]?.images ?? [];
    if (existing.length >= 2 && target.slug !== "canadian-youth-congress") continue;
    if (target.slug === "canadian-youth-congress" && existing.length >= 1) continue;
    const dir = path.join(ROOT, "public/media/movements", target.slug);
    await mkdir(dir, { recursive: true });
    const name = existing.length === 0 ? "hero" : `0${existing.length}`;
    try {
      console.log(`${target.slug}: ${target.file}`);
      const buffer = await download(target.file);
      const dest = path.join(dir, `${name}.webp`);
      await sharp(buffer)
        .rotate()
        .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(dest);
      const image: HistoricalImage = {
        src: `/media/movements/${target.slug}/${name}.webp`,
        alt: target.caption,
        caption: target.caption,
        year: target.year,
        author: "Wikimedia Commons",
        license: target.license,
        sourceUrl: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(target.file.replaceAll(" ", "_"))}`,
      };
      manifest[target.slug] = { images: [...existing, image] };
      console.log(`  saved ${image.src} (${buffer.length} bytes)`);
    } catch (error) {
      console.warn(`  failed ${target.file}:`, error);
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  await writeFile(OUT_MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
