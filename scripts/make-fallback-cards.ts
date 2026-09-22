import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const cards = [
  {
    slug: "anc-youth-league",
    title: "ANC Youth League",
    subtitle: "1944",
    caption:
      "Типографическая карточка. Архивный портрет (Young Mandela.jpg на Wikimedia Commons) не удалось скачать из-за лимита 429; нужна ручная подстановка.",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Young_Mandela.jpg",
  },
  {
    slug: "korean-national-youth",
    title: "조선민족청년단",
    subtitle: "1946–1949",
    caption:
      "Типографическая карточка. Архивный кадр (Rhee Syng-Man in 1948.jpg) не удалось скачать из-за лимита Wikimedia 429; нужна ручная подстановка.",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Rhee_Syng-Man_in_1948.jpg",
  },
];

async function main() {
  const manifestPath = "src/data/media-manifest.json";
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Record<
    string,
    { images: Array<Record<string, string>> }
  >;

  for (const card of cards) {
    if ((manifest[card.slug]?.images || []).length > 0) continue;
    const dir = path.join("public/media/movements", card.slug);
    await mkdir(dir, { recursive: true });
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
      <rect width="1600" height="1000" fill="#e7d8be"/>
      <rect x="48" y="48" width="1504" height="904" fill="none" stroke="#7c2d2d" stroke-width="2"/>
      <text x="80" y="160" fill="#7c2d2d" font-size="22" font-family="Georgia, serif" letter-spacing="6">АРХИВ</text>
      <text x="80" y="500" fill="#1c1612" font-size="64" font-family="Georgia, serif">${card.title}</text>
      <text x="80" y="580" fill="#7c2d2d" font-size="32" font-family="Georgia, serif">${card.subtitle}</text>
      <text x="80" y="880" fill="#3d342c" font-size="22" font-family="Georgia, serif">Молодёжь мира · 1940–1950</text>
    </svg>`;
    await sharp(Buffer.from(svg)).webp({ quality: 80 }).toFile(path.join(dir, "hero.webp"));
    manifest[card.slug] = {
      images: [
        {
          src: `/media/movements/${card.slug}/hero.webp`,
          alt: card.caption,
          caption: card.caption,
          author: "локальная типографическая карточка",
          license: "внутренний макет атласа",
          sourceUrl: card.sourceUrl,
        },
      ],
    };
    console.log("wrote", card.slug);
  }

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

main();
