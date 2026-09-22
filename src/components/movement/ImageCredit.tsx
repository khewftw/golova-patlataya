import type { HistoricalImage } from "@/types/movement";

export function ImageCredit({
  image,
  compact = false,
}: {
  image: HistoricalImage;
  compact?: boolean;
}) {
  const summary = [image.year, image.author, image.license].filter(Boolean).join(" · ");

  return (
    <figcaption className="px-1 pt-2 text-[12px] leading-5 text-muted">
      <p>{image.caption}</p>
      <details className="mt-1">
        <summary className="cursor-pointer select-none text-[11px] tracking-[0.04em] text-muted/90 hover:text-ink-soft">
          {compact ? "кредит" : "источник кадра"}
          {summary ? ` · ${summary}` : ""}
        </summary>
        <p className="mt-1 text-[11px] leading-5">
          {image.author ? <span>{image.author}. </span> : null}
          {image.license ? (
            image.licenseUrl ? (
              <a
                href={image.licenseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-accent/30 underline-offset-2 hover:text-accent"
              >
                {image.license}
              </a>
            ) : (
              <span>{image.license}</span>
            )
          ) : null}
          {" · "}
          <a
            href={image.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-accent/30 underline-offset-2 hover:text-accent"
          >
            оригинал
          </a>
        </p>
      </details>
    </figcaption>
  );
}
