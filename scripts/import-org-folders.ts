import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { HistoricalImage } from "../src/types/movement";

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, "src", "data", "media-manifest.json");
const MEDIA_ROOT = path.join(ROOT, "public", "media", "movements");

type Job = {
  slug: string;
  images: Array<{
    from: string;
    caption: string;
    year?: string;
    author?: string;
  }>;
};

const JOBS: Job[] = [
  {
    slug: "komsomol",
    images: [
      {
        from: "public/organization/komsomol vlksm/i (7).webp",
        caption:
          "Комсомольцы у переходящего знамени за участие в сельхозработах. Кадр из материалов статьи; точная дата в подписи не указана.",
        author: "материалы статьи",
      },
      {
        from: "public/organization/komsomol vlksm/i (5).webp",
        caption:
          "Строй девушек с комсомольским журналом на площади. Парадный кадр советской молодёжи; год съёмки в файле не подписан.",
        author: "материалы статьи",
      },
      {
        from: "public/organization/komsomol vlksm/i (8).webp",
        caption:
          "Дополнительный кадр из папки ВЛКСМ. Подпись-источник в файле отсутствует.",
        author: "материалы статьи",
      },
    ],
  },
  {
    slug: "gil",
    images: [
      {
        from: "public/organization/gil-italiya./i (10).webp",
        caption:
          "Девочки у палатки на фоне надписи DUCE. Лагерный кадр фашистской итальянской молодёжи.",
        author: "материалы статьи",
      },
      {
        from: "public/organization/gil-italiya./i (9).webp",
        caption:
          "Значок Gioventù del Littorio с девизом Vincere. Предмет организации, не групповой портрет.",
        author: "материалы статьи",
      },
    ],
  },
  {
    slug: "dai-nippon-seishonendan",
    images: [
      {
        from: "public/organization/Japan/Dainihon_Seinento.jpg",
        caption:
          "Марш японской молодёжи с флагами. Кадр из папки статьи о Дай Ниппон Сэйсёнэндан / смежных союзах военного времени.",
        author: "материалы статьи",
      },
      {
        from: "public/organization/Japan/Seinendan_Parade.jpg",
        caption:
          "Строй с бамбуковыми пиками. По облику ближе к сэйнэндан на оккупированной Яве, чем к метрополии; в статье этот колониальный аналог отдельно оговорён.",
        author: "материалы статьи",
      },
    ],
  },
  {
    slug: "zmp",
    images: [
      {
        from: "public/organization/ZMP/i (14).webp",
        caption:
          "Митинг молодёжи со знамёнами, табличка Bydgoskie. Польский кадр из папки ZMP; точная атрибуция в файле не подписана.",
        author: "материалы статьи",
      },
      {
        from: "public/organization/ZMP/i (13).webp",
        caption:
          "Значок SZMW. Это не эмблема ZMP 1948 года, а смежный предмет польского молодёжного движения; дан как контекст.",
        author: "материалы статьи",
      },
    ],
  },
  {
    slug: "canadian-youth-congress",
    images: [
      {
        from: "public/organization/ Canadian Youth Congress /Canadian_House_of_Commons_-_March_10_1938.jpg",
        caption:
          "Палата общин Канады, 10 марта 1938 года. Политический адрес, куда CYC пытался донести требования; это не групповой портрет делегатов конгресса.",
        year: "1938",
        author: "материалы статьи",
      },
      {
        from: "public/organization/ Canadian Youth Congress /CCF_convention_1944.gif",
        caption:
          "Съезд CCF, 1944 год. Соседняя левая среда Канады военных лет, не зал самого Youth Congress.",
        year: "1944",
        author: "материалы статьи",
      },
    ],
  },
  {
    slug: "pachuco-united-states",
    images: [
      {
        from: "public/organization/pachuco/83d67c977dd18fbe5cd6c358a1b05de4.jpg",
        caption:
          "Двое молодых людей в костюмах. Кадр из папки pachuco; водяной знак на снимке, точная атрибуция в файле не указана.",
        author: "материалы статьи",
      },
      {
        from: "public/organization/pachuco/1e5152cecc5cba7645287e7bd3b0ad08.jpg",
        caption: "Дополнительный кадр из папки pachuco.",
        author: "материалы статьи",
      },
      {
        from: "public/organization/pachuco/i (4).webp",
        caption: "Дополнительный кадр из папки pachuco.",
        author: "материалы статьи",
      },
    ],
  },
  {
    slug: "pachuco-mexico",
    images: [
      {
        from: "public/organization/pachuco Mexico/4ffc8e331862393ef5aa7c999c774901.jpg",
        caption:
          "Трое молодых людей в костюмах, девушка в центре. Кадр из папки «pachuco Mexico».",
        author: "материалы статьи",
      },
      {
        from: "public/organization/pachuco Mexico/0678b1ae6d4d4d44d38960f78943fb13.jpg",
        caption: "Дополнительный кадр из папки «pachuco Mexico».",
        author: "материалы статьи",
      },
      {
        from: "public/organization/pachuco Mexico/6352fc0dfdf6ed43472e0cf7ce2a1c7a.jpg",
        caption: "Дополнительный кадр из папки «pachuco Mexico».",
        author: "материалы статьи",
      },
    ],
  },
  {
    slug: "swing-youth",
    images: [
      {
        from: "public/organization/swing jugend/Swing_tanzen_verboten.jpg",
        caption:
          "Табличка «Swinging tanzen verboten». Формула запрета свинга, связанная с культурной политикой рейха.",
        author: "материалы статьи",
      },
      {
        from: "public/organization/swing jugend/i (1).webp",
        caption: "Кадр из папки Swing Jugend.",
        author: "материалы статьи",
      },
      {
        from: "public/organization/swing jugend/i (2).webp",
        caption: "Кадр из папки Swing Jugend.",
        author: "материалы статьи",
      },
      {
        from: "public/organization/swing jugend/i (3).webp",
        caption: "Кадр из папки Swing Jugend.",
        author: "материалы статьи",
      },
    ],
  },
  {
    slug: "boy-scouts-of-america",
    images: [
      {
        from: "public/organization/ Boy Scouts of America./4fe9c2ef1b05734221bb9d2ad0b6576f.jpg",
        caption: "Кадр из папки Boy Scouts of America.",
        author: "материалы статьи",
      },
      {
        from: "public/organization/ Boy Scouts of America./i (12).webp",
        caption: "Кадр из папки Boy Scouts of America.",
        author: "материалы статьи",
      },
    ],
  },
];

async function writeWebp(buffer: Buffer, dest: string) {
  await sharp(buffer)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(dest);
}

async function main() {
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8")) as Record<
    string,
    { images: HistoricalImage[] }
  >;

  for (const job of JOBS) {
    const dir = path.join(MEDIA_ROOT, job.slug);
    await mkdir(dir, { recursive: true });
    const images: HistoricalImage[] = [];
    for (const [index, item] of job.images.entries()) {
      const srcPath = path.join(ROOT, item.from);
      const name = index === 0 ? "hero.webp" : `0${index}.webp`;
      const dest = path.join(dir, name);
      try {
        const buffer = await readFile(srcPath);
        await writeWebp(buffer, dest);
        const publicSrc = `/media/movements/${job.slug}/${name}`;
        images.push({
          src: publicSrc,
          alt: item.caption,
          caption: item.caption,
          year: item.year,
          author: item.author ?? "материалы статьи",
          license: "уточнить",
          sourceUrl: publicSrc,
        });
        console.log(`saved ${publicSrc}`);
      } catch (error) {
        console.warn(`skip ${item.from}:`, error);
      }
    }
    if (images.length > 0) {
      if (job.slug === "swing-youth" && manifest[job.slug]?.images?.length) {
        const existing = manifest[job.slug].images;
        const merged = [...existing];
        for (const image of images) {
          if (!merged.some((item) => item.caption === image.caption)) merged.push(image);
        }
        manifest[job.slug] = { images: merged };
      } else {
        manifest[job.slug] = { images };
      }
    }
  }

  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log("wrote manifest");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
