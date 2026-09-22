import type { HistoricalSource } from "@/types/movement";

const TYPE_LABELS: Record<HistoricalSource["type"], string> = {
  encyclopedia: "справочник",
  archive: "архив",
  book: "книга",
  article: "статья",
  museum: "музей",
  official: "официально",
};

export function SourcesList({ sources }: { sources: HistoricalSource[] }) {
  return (
    <section className="mt-10 border-t border-[color:var(--rule)] pt-6">
      <p className="text-[11px] tracking-[0.18em] text-muted uppercase">Источники</p>
      <ul className="mt-4 space-y-3">
        {sources.map((source) => (
          <li key={`${source.title}-${source.url}`} className="text-sm leading-6">
            <p className="text-[10px] tracking-[0.14em] text-muted uppercase">
              {source.publisher}
              <span className="mx-1.5 text-accent">·</span>
              {TYPE_LABELS[source.type]}
            </p>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline decoration-accent/30 underline-offset-3 hover:text-accent"
            >
              {source.title}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
