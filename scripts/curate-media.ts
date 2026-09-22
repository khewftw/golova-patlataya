/**
 * Download a curated set of Commons files and rewrite those slugs in the manifest.
 * Use when search-based sync pulled modern, wrong, or non-image files.
 */

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { HistoricalImage } from "../src/types/movement";

const ROOT = process.cwd();
const OUT_MANIFEST = path.join(ROOT, "src/data/media-manifest.json");
const MEDIA_ROOT = path.join(ROOT, "public/media/movements");
const UA = "ksenia-map/1.0 (historical atlas; local preprocessing; educational non-commercial)";

type Target = {
  slug: string;
  file: string;
  caption: string;
  alt?: string;
  year?: string;
  author?: string;
  license: string;
  licenseUrl?: string;
};

const TARGETS: Target[] = [
  {
    slug: "zazous",
    file: "Zazou h ill.png",
    caption:
      "Историческая схема мужского костюма zazou: длинный пиджак и характерный силуэт. Свободных архивных портретов сцены на Commons почти нет; это графическая реконструкция стиля, не фотография конкретного кружка.",
    year: "реконструкция",
    author: "jnl / Wikimedia Commons",
    license: "CC BY-SA",
  },
  {
    slug: "zazous",
    file: "Zazou in color.svg",
    caption:
      "Цветная схема того же силуэта. Не фотография оккупированного Парижа и не кадр Сопротивления — только костюмный язык субкультуры.",
    author: "Gebu / Wikimedia Commons",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    slug: "churchill-club",
    file: "ChurchillClub.jpg",
    caption:
      "Участники Churchill-klubben. Школьный кружок Ольборга 1941–1942 годов, а не общенациональная датская сеть Сопротивления.",
    author: "неизвестен / Wikimedia Commons",
    license: "см. страницу файла",
  },
  {
    slug: "churchill-club",
    file: "The Churchill Club.png",
    caption: "Ещё один архивный групповой кадр клуба Черчилля.",
    author: "неизвестен / Wikimedia Commons",
    license: "см. страницу файла",
  },
  {
    slug: "fronte-gioventu",
    file: "An Italian partisan in Florence, 14 August 1944. TR2282.jpg",
    caption:
      "Итальянский партизан во Флоренции, 14 августа 1944 года. Кадр Сопротивления 1943–1945 годов, а не довоенной фашистской GIL.",
    year: "1944",
    author: "Tanner (Capt), War Office",
    license: "Public domain",
  },
  {
    slug: "fronte-gioventu",
    file: "Partigiane a Brera.jpg",
    caption:
      "Женщины с оружием после освобождения, Милан, 26 апреля 1945 года. Кадр, вероятно, постановочный; он показывает атмосферу конца войны, а не штаб Fronte della Gioventù.",
    year: "1945",
    author: "Valentino Petrelli",
    license: "Public domain",
  },
  {
    slug: "epon",
    file: "EPON Uni Student Poster Ilioupoli.jpg",
    caption:
      "Агитационный плакат ЭПОН: призыв к студентам. Экспонат Музея национального сопротивления в Илиуполи; сам текст военного времени.",
    author: "Catlemur / Museum of National Resistance of Ilioupoli",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    slug: "epon",
    file: "Days EPON Poster Ilioupoli.jpg",
    caption: "Ещё один плакат ЭПОН из того же музейного собрания.",
    author: "Catlemur / Museum of National Resistance of Ilioupoli",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    slug: "skoj",
    file: "Ivo Lola Ribar.jpg",
    caption:
      "Иво Лола Рибар, секретарь ЦК SKOJ, погибший в ноябре 1943 года. Портрет военного времени, а не послевоенного государственного союза.",
    year: "до 1943",
    author: "Žorž Skrigin",
    license: "см. страницу файла",
  },
  {
    slug: "skoj",
    file: "Centralni komitet SKOJ-a.jpg",
    caption: "Центральный комитет SKOJ. Кадр партийной молодёжной иерархии, не спонтанной субкультуры.",
    author: "Wikimedia Commons",
    license: "см. страницу файла",
  },
  {
    slug: "skoj",
    file: "Sekretar SKOJ-a Ivo Lola Ribar govori na Prvom kongresu omladine Jugoslavije.jpg",
    caption: "Иво Лола Рибар выступает на Первом съезде молодёжи Югославии.",
    author: "Wikimedia Commons",
    license: "см. страницу файла",
  },
  {
    slug: "rms-bulgaria",
    file: "Bulgarian partisan Khaldei.jpg",
    caption:
      "Болгарские партизаны, фото Евгения Халдея, 1944 год. РМС в войну был связан с партизанским движением; кадр показывает среду, а не членский билет.",
    year: "1944",
    author: "Евгений Халдей",
    license: "см. страницу файла",
  },
  {
    slug: "rms-bulgaria",
    file: "Bulgarian partisans Khaldei.jpg",
    caption: "Ещё один кадр Халдея: болгарские партизаны 1944 года.",
    year: "1944",
    author: "Евгений Халдей",
    license: "см. страницу файла",
  },
  {
    slug: "rms-bulgaria",
    file: "Plovdiv September 1944.jpg",
    caption: "Пловдив, сентябрь 1944 года — дни переворота Отечественного фронта, когда РМС выходит из подполья.",
    year: "1944",
    author: "Wikimedia Commons",
    license: "см. страницу файла",
  },
  {
    slug: "straja-tarii",
    file: "Logo and badge of Straja Țării.svg",
    caption:
      "Эмблема Straja Țării (1935–1940). Свободных лагерных фотографий стражеров на Commons почти нет; знак — современная прорисовка исторического значка.",
    author: "Dahn",
    license: "Public domain",
  },
  {
    slug: "frente-juventudes",
    file: "Sancho Dávila flechas y pelayos 1938.jpg",
    caption:
      "Санчо Давила говорит с детьми из секций Flechas и Pelayos в лагере Бакио, 30 июля 1938 года. Прямой предшественник Frente de Juventudes 1940 года.",
    year: "1938",
    author: "неизвестен",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    slug: "frente-juventudes",
    file: "Campamento Mola flechas y pelayos 1938.jpg",
    caption: "Прибытие во «флечас» в лагерь «Мола», Бакио, 30 июля 1938 года.",
    year: "1938",
    author: "неизвестен",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    slug: "frente-juventudes",
    file: "Inauguración campamento flechas y pelayos Baquio 1938.jpg",
    caption: "Поднятие флага на открытии лагеря в Бакио, 1938 год.",
    year: "1938",
    author: "неизвестен",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    slug: "mocidade-portuguesa",
    file: "PT-ABM-PHF-1296 - Desfile de Lusitos, da Mocidade Portuguesa, Funchal.jpg",
    caption:
      "Парад «лузитуш» Mocidade Portuguesa на авениде Арриага в Фуншале, 28 мая 1939 года. Архив Мадейры.",
    year: "1939",
    author: "Foto Figueiras / Arquivo e Biblioteca da Madeira",
    license: "Public domain (Portugal / URAA)",
  },
  {
    slug: "mocidade-portuguesa",
    file: "16985 - Aspirantes da Mocidade Portuguesa numa sessão de ginástica (1938).jpg",
    caption: "Аспиранты Mocidade Portuguesa на гимнастике, 1938 год.",
    year: "1938",
    author: "Wikimedia Commons",
    license: "см. страницу файла",
  },
  {
    slug: "mocidade-portuguesa",
    file: "16980 - Um grupo de aspirantes da Mocidade Portuguesa.jpg",
    caption: "Группа аспирантов Mocidade Portuguesa.",
    author: "Wikimedia Commons",
    license: "см. страницу файла",
  },
  {
    slug: "pachuco-united-states",
    file: "Zoot Suiters On Parade.jpg",
    caption:
      "Трое мужчин в вариациях zoot suit. Снимок Ollie Atkins; National Archives / Nixon Library. Стиль pachuco, а не членский союз.",
    year: "1946",
    author: "Ollie Atkins",
    license: "Public domain",
  },
  {
    slug: "pachuco-united-states",
    file: 'Zoot Suit, Mexican "drape style".png',
    caption: "Zoot suit в «мексиканском» drape style — костюмный язык, общий для сцены по обе стороны границы.",
    author: "Wikimedia Commons",
    license: "Public domain",
  },
  {
    slug: "anc-youth-league",
    file: "Young Mandela.jpg",
    caption:
      "Нельсон Мандела в молодости (снимок относят к 1937 году). Один из основателей ANC Youth League (1944). Не фотография съезда лиги.",
    year: "1937",
    author: "неизвестен",
    license: "Public domain",
  },
  {
    slug: "aisf",
    file: "Picketing in front of Medical School at Bangalore during examination during Quit India movement, organised by Indian National Congress.jpg",
    caption:
      "Пикет у медицинской школы в Бангалоре во время Quit India, 1942 год. Студенческая политика тех лет, в которой участвовала и AISF; кадр не подписан как конференция федерации.",
    year: "1942",
    author: "Dore Chakravarty",
    license: "CC BY-SA 2.5",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.5",
  },
  {
    slug: "aisf",
    file: "Procession at Bangalore during Quit India movement, by Indian National Congress.jpg",
    caption: "Процессия в Бангалоре во время Quit India, 1942 год. Контекст студенческой и городской мобилизации.",
    year: "1942",
    author: "Dore Chakravarty",
    license: "CC BY-SA 2.5",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.5",
  },
  {
    slug: "new-democratic-youth-league",
    file: "Flag of the Communist Youth League of China.svg",
    caption:
      "Флаг союза, опубликованный 4 мая 1950 года. Геральдика нового государственного института, не случайный современный флаг КНР.",
    year: "1950",
    author: "Communist Youth League of China",
    license: "Public domain",
  },
  {
    slug: "yokusan-sonendan",
    file: "Susume Ichi-oku Hinotama Da, Imperial Rule Assistance Association, 1942.jpg",
    caption:
      "Плакат Ёкусанкай 1942 года: «Сто миллионов, вперёд как огненные шары». Визуальный язык государственной мобилизации, в которой существовал и сонэндан.",
    year: "1942",
    author: "大政翼賛會",
    license: "Public domain",
  },
  {
    slug: "yokusan-sonendan",
    file: "Yokusan Sonendan.svg",
    caption: "Значок члена Ёкусан сонэндан по предписанию 13 июня 1942 года.",
    year: "1942",
    author: "Kinchaku",
    license: "CC0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  },
  {
    slug: "pesindo",
    file: "COLLECTIE TROPENMUSEUM Militairen bij een affiche met het portret van Stalin door hen aangetroffen op het kantoor van de Pemuda Sosialis Indonesia (Pesindo) TMnr 60054585.jpg",
    caption:
      "Голландские военные у плаката Сталина, найденного в конторе Pesindo. Tropenmuseum. Кадр фиксирует организацию, а не её самопрезентацию.",
    year: "1940-е",
    author: "Tropenmuseum",
    license: "см. страницу файла",
  },
  {
    slug: "vanguard-youth",
    file: "Ba Dinh Square September 2nd, 1945.jpg",
    caption:
      "Площадь Бадинь, Ханой, 2 сентября 1945 года. Национальный контекст Августовской революции; сама Thanh niên Tiền phong действовала прежде всего в Кохинхине.",
    year: "1945",
    author: "неизвестен",
    license: "Public domain",
  },
  {
    slug: "korean-national-youth",
    file: "Lee Beom-seok 194809.jpg",
    caption:
      "Ли Бомсок выступает перед Центральным правительственным зданием, сентябрь 1948 года. Основатель 조선민족청년단, не групповой портрет союза.",
    year: "1948",
    author: "неизвестен",
    license: "Public domain",
  },
  {
    slug: "korean-national-youth",
    file: "Lee Beom-seok and Chang Jun-ha 1945-August-16.jpg",
    caption: "Ли Бомсок и Чан Чун Ха, Шанхай, 16 августа 1945 года — до основания ассоциации, но тот же политический актор.",
    year: "1945",
    author: "неизвестен",
    license: "Public domain",
  },
  {
    slug: "seri-thai",
    file: "Free Thai Movement 1945.jpg",
    caption:
      "Участники Seri Thai на параде по Ратчадамнен в Бангкоке после конца войны, 1945 год. Широкое движение, не специализированный молодёжный союз.",
    year: "1945",
    author: "неизвестен",
    license: "Public domain",
  },
  {
    slug: "seri-thai",
    file: "Free Thai insignia.svg",
    caption: "Знак Free Thai. Вспомогательный геральдический кадр к парадному фото 1945 года.",
    author: "Pi@k",
    license: "Public domain",
  },
  {
    slug: "juventude-brasileira",
    file: "Getúlio Vargas - 1930.jpg",
    caption:
      "Жетулиу Варгас, 1930 год. Политический контекст Estado Novo, в котором в 1940 году появилась Juventude Brasileira. Не фотография самой молодёжной организации.",
    year: "1930",
    author: "неизвестен",
    license: "Public domain",
  },
  {
    slug: "eureka-youth-league",
    file: "Eureka Flag.svg",
    caption:
      "Флаг Eureka Stockade (1854). Лига взяла это имя в 1941 году как австралийский демократический миф. Это не фотография членов EYL.",
    author: "Wikimedia Commons",
    license: "Public domain",
  },
  {
    slug: "pachuco-mexico",
    file: "Zoot Suit, Mexican \"drape style\".png",
    caption:
      "Zoot suit в «мексиканском» drape style. Костюмный язык, общий для мексиканской и чикано-сцены; не портрет Tin Tan и не современный памятник.",
    author: "Wikimedia Commons",
    license: "Public domain",
  },
  {
    slug: "gadna",
    file: 'A GROUP OF YOUNG "HAGANA" MEMBERS MARCHING IN THE JEZREEL VALLEY NEAR AFULA. חברי הגנה צעירים צועדים בעמק יזרעאל, ליד עפולה.D40-041.jpg',
    caption:
      "Молодые члены «Хаганы» идут строем в Изреэльской долине близ Афулы. Допризывная и оборонная среда, из которой выросла Gadna; кадр не подписан как учебный взвод Gadna.",
    author: "Government Press Office / Wikimedia Commons",
    license: "см. страницу файла",
  },
];

function sourceUrl(file: string) {
  return `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replaceAll(" ", "_"))}`;
}

async function resolveFileUrl(file: string) {
  const api = new URL("https://commons.wikimedia.org/w/api.php");
  api.searchParams.set("action", "query");
  api.searchParams.set("format", "json");
  api.searchParams.set("origin", "*");
  api.searchParams.set("prop", "imageinfo");
  api.searchParams.set("iiprop", "url");
  api.searchParams.set("iiurlwidth", "1600");
  api.searchParams.set("titles", file.startsWith("File:") ? file : `File:${file}`);
  const response = await fetch(api, { headers: { "User-Agent": UA } });
  if (!response.ok) throw new Error(`Commons API ${response.status} for ${file}`);
  const data = (await response.json()) as {
    query?: { pages?: Record<string, { imageinfo?: Array<{ thumburl?: string; url?: string }> }> };
  };
  const info = Object.values(data.query?.pages ?? {})[0]?.imageinfo?.[0];
  const url = info?.thumburl || info?.url;
  if (!url) throw new Error(`No image URL for ${file}`);
  return url;
}

async function download(file: string) {
  const url = await resolveFileUrl(file);
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    const response = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
    if (response.ok) return Buffer.from(await response.arrayBuffer());
    lastError = new Error(`HTTP ${response.status} for ${file}`);
    if (response.status === 429 || response.status >= 500) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 4000));
      continue;
    }
    throw lastError;
  }
  throw lastError ?? new Error(`Download failed for ${file}`);
}

async function main() {
  const only = process.argv
    .find((arg) => arg.startsWith("--only="))
    ?.slice(7)
    .split(",")
    .filter(Boolean);

  const manifest = JSON.parse(await readFile(OUT_MANIFEST, "utf8")) as Record<
    string,
    { images: HistoricalImage[] }
  >;

  const slugs = [...new Set(TARGETS.map((target) => target.slug))].filter(
    (slug) => !only || only.includes(slug),
  );

  const append = process.argv.includes("--append");

  for (const slug of slugs) {
    const dir = path.join(MEDIA_ROOT, slug);
    if (!append) {
      await rm(dir, { recursive: true, force: true });
      manifest[slug] = { images: [] };
    }
    await mkdir(dir, { recursive: true });
    manifest[slug] ??= { images: [] };
  }

  for (const target of TARGETS) {
    if (only && !only.includes(target.slug)) continue;
    const existing = manifest[target.slug]?.images ?? [];
    if (append && existing.some((image) => image.sourceUrl === sourceUrl(target.file))) continue;
    const name = existing.length === 0 ? "hero" : `0${existing.length}`;
    try {
      console.log(`${target.slug}: ${target.file}`);
      const buffer = await download(target.file);
      const dest = path.join(MEDIA_ROOT, target.slug, `${name}.webp`);
      await sharp(buffer)
        .rotate()
        .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(dest);
      const image: HistoricalImage = {
        src: `/media/movements/${target.slug}/${name}.webp`,
        alt: target.alt ?? target.caption,
        caption: target.caption,
        year: target.year,
        author: target.author,
        license: target.license,
        licenseUrl: target.licenseUrl,
        sourceUrl: sourceUrl(target.file),
      };
      manifest[target.slug] = { images: [...existing, image] };
      console.log(`  saved ${image.src}`);
    } catch (error) {
      console.warn(`  failed ${target.file}:`, error);
    }
    await new Promise((resolve) => setTimeout(resolve, 2500));
  }

  await writeFile(OUT_MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Wrote ${OUT_MANIFEST}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
