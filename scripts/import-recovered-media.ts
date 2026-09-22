import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { HistoricalImage } from "../src/types/movement";

const items: Array<{
  slug: string;
  src: string;
  caption: string;
  year?: string;
  author: string;
  license: string;
  sourceUrl: string;
}> = [
  {
    slug: "anc-youth-league",
    src: "/tmp/ksenia-media/mandela.jpg",
    caption:
      "Нельсон Мандела в молодости (снимок относят к 1937 году). Один из основателей ANC Youth League (1944). Не фотография съезда лиги.",
    year: "1937",
    author: "неизвестен",
    license: "Public domain",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Young_Mandela.jpg",
  },
  {
    slug: "pesindo",
    src: "/tmp/ksenia-media/pesindo.jpg",
    caption:
      "Голландские военные у плаката Сталина, найденного в конторе Pesindo. Tropenmuseum. Кадр фиксирует организацию, а не её самопрезентацию.",
    year: "1940-е",
    author: "Tropenmuseum",
    license: "см. страницу файла",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:COLLECTIE_TROPENMUSEUM_Militairen_bij_een_affiche_met_het_portret_van_Stalin_door_hen_aangetroffen_op_het_kantoor_van_de_Pemuda_Sosialis_Indonesia_(Pesindo)_TMnr_60054585.jpg",
  },
  {
    slug: "pachuco-mexico",
    src: "/tmp/ksenia-media/zoot.png",
    caption:
      "Zoot suit в «мексиканском» drape style. Костюмный язык транснациональной сцены pachuco; не современный памятник Tin Tan.",
    author: "Wikimedia Commons",
    license: "Public domain",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Zoot_Suit,_Mexican_%22drape_style%22.png",
  },
  {
    slug: "pachuco-united-states",
    src: "/tmp/ksenia-media/zoot.png",
    caption:
      "Zoot suit, «мексиканский» drape style. Костюмный язык сцены, общий с приграничной Мексикой.",
    author: "Wikimedia Commons",
    license: "Public domain",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Zoot_Suit,_Mexican_%22drape_style%22.png",
  },
];

async function main() {
  const manifestPath = "src/data/media-manifest.json";
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Record<
    string,
    { images: HistoricalImage[] }
  >;

  for (const item of items) {
    const dir = path.join("public/media/movements", item.slug);
    await mkdir(dir, { recursive: true });
    const existing = manifest[item.slug]?.images ?? [];
    if (existing.some((image) => image.sourceUrl === item.sourceUrl)) continue;
    const name = existing.length === 0 ? "hero" : `0${existing.length}`;
    const dest = path.join(dir, `${name}.webp`);
    await sharp(item.src)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(dest);
    const image: HistoricalImage = {
      src: `/media/movements/${item.slug}/${name}.webp`,
      alt: item.caption,
      caption: item.caption,
      year: item.year,
      author: item.author,
      license: item.license,
      sourceUrl: item.sourceUrl,
    };
    manifest[item.slug] = { images: [...existing, image] };
    console.log("wrote", dest);
  }

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

main();
