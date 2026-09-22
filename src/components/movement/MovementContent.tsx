import Image from "next/image";
import Link from "next/link";
import { MOVEMENT_TYPE_LABELS } from "@/data/site";
import { Gallery } from "@/components/movement/Gallery";
import { ImageCredit } from "@/components/movement/ImageCredit";
import { SourcesList } from "@/components/movement/SourcesList";
import type { HistoricalImage, Movement } from "@/types/movement";

type MovementContentProps = {
  movement: Movement;
  variant: "modal" | "page";
};

export function MovementContent({ movement, variant }: MovementContentProps) {
  const types = movement.types ?? [movement.type];
  const hero = movement.gallery[0];
  const inlineSrcs = new Set(
    movement.storySections.flatMap((section) => section.imageSrcs ?? []),
  );
  const rest = movement.gallery.filter((image) => image !== hero && !inlineSrcs.has(image.src));
  const isPage = variant === "page";
  const galleryImages = isPage ? rest : movement.gallery.filter((image) => image !== hero).slice(0, 3);

  return (
    <article className={isPage ? "mx-auto max-w-3xl px-5 py-10 md:py-16" : ""}>
      <p className="text-[11px] tracking-[0.2em] text-muted uppercase">
        {movement.historicalCountryName}
        <span className="mx-2 text-accent">/</span>
        {movement.location}
      </p>
      <h1 className="font-display mt-2 text-4xl leading-tight text-ink md:text-5xl">
        {movement.title}
      </h1>
      <p className="mt-2 text-sm text-ink-soft italic">{movement.originalTitle}</p>
      <div className="mt-4 flex flex-wrap gap-2 text-[11px] tracking-[0.14em] uppercase">
        <span className="border border-[color:var(--rule)] px-2 py-1">
          {movement.fromYear}–{movement.toYear}
        </span>
        {types.map((type) => (
          <span key={type} className="border border-accent/30 px-2 py-1 text-accent">
            {MOVEMENT_TYPE_LABELS[type]}
          </span>
        ))}
      </div>

      {hero ? (
        <figure className={`relative mt-6 overflow-hidden bg-paper-deep ${isPage ? "" : ""}`}>
          <div className={`relative ${isPage ? "aspect-[16/9]" : "aspect-[16/10]"}`}>
            <Image
              src={hero.src}
              alt={hero.alt}
              fill
              sizes={isPage ? "(max-width: 768px) 100vw, 900px" : "800px"}
              className="object-cover"
              priority={isPage}
            />
          </div>
          <ImageCredit image={hero} />
        </figure>
      ) : null}

      <p className="mt-6 text-[17px] leading-8 text-ink-soft">{movement.intro}</p>
      {movement.geographyNote ? (
        <p className="mt-3 border-l-2 border-accent/40 pl-3 text-sm leading-6 text-ink-soft">
          {movement.geographyNote}
        </p>
      ) : null}

      <section className="mt-8 grid gap-3 sm:grid-cols-2">
        {movement.facts.map((fact) => (
          <div key={fact.label} className="border border-[color:var(--rule)] px-3 py-3">
            <p className="text-[10px] tracking-[0.16em] text-muted uppercase">{fact.label}</p>
            <p className="mt-1 text-sm leading-6">{fact.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-8">
        <p className="text-[11px] tracking-[0.18em] text-muted uppercase">Хроника</p>
        <ol className="mt-3 space-y-3">
          {movement.timeline.map((event) => (
            <li key={`${event.year}-${event.title}`} className="grid grid-cols-[5.5rem_1fr] gap-3">
              <span className="text-xs tracking-[0.08em] text-accent">{event.year}</span>
              <div>
                <p className="font-display text-lg leading-tight">{event.title}</p>
                <p className="mt-1 text-sm leading-6 text-ink-soft">{event.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {isPage
        ? movement.storySections.map((section) => {
            const inlineImages = (section.imageSrcs ?? [])
              .map((src) => movement.gallery.find((image) => image.src === src))
              .filter((image): image is HistoricalImage => Boolean(image));
            return (
              <section key={section.heading} className="mt-8">
                <h2 className="font-display text-2xl">{section.heading}</h2>
                <p className="mt-3 text-[17px] leading-8 text-ink-soft">{section.body}</p>
                {inlineImages.map((inlineImage) => (
                  <figure key={inlineImage.src} className="relative mt-5 overflow-hidden bg-paper-deep">
                    <div className="relative aspect-[16/10]">
                      <Image
                        src={inlineImage.src}
                        alt={inlineImage.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 900px"
                        className="object-contain"
                      />
                    </div>
                    <ImageCredit image={inlineImage} />
                  </figure>
                ))}
              </section>
            );
          })
        : null}

      {variant === "modal" ? (
        <a
          href={`/country/${movement.slug}`}
          className="mt-8 inline-flex min-h-11 items-center border border-accent px-4 text-sm tracking-[0.08em] text-accent uppercase transition hover:bg-accent hover:text-paper"
        >
          Открыть полную историю
        </a>
      ) : (
        <Link
          href="/"
          className="mt-8 inline-flex min-h-11 items-center text-sm tracking-[0.12em] text-accent uppercase underline underline-offset-4"
        >
          Назад к карте
        </Link>
      )}

      <Gallery images={galleryImages} compact={!isPage} />
      <SourcesList sources={movement.sources} />
    </article>
  );
}
