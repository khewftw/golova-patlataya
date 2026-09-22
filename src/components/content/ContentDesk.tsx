"use client";

import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Movement } from "@/types/movement";

type ContentDeskProps = {
  movements: Movement[];
};

type RowStatus = {
  state: "idle" | "busy" | "ok" | "error";
  text?: string;
};

export function ContentDesk({ movements }: ContentDeskProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statuses, setStatuses] = useState<Record<string, RowStatus>>({});

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return movements.filter((movement) => {
      if (!needle) return true;
      return [
        movement.title,
        movement.originalTitle,
        movement.historicalCountryName,
        movement.slug,
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [movements, query]);

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 md:py-16">
      <p className="text-[11px] tracking-[0.2em] text-muted uppercase">Локальный стол</p>
      <h1 className="font-display mt-2 text-4xl leading-tight">Загрузка материалов</h1>
      <p className="mt-4 text-[17px] leading-8 text-ink-soft">
        Скачай Markdown страны, поправь текст у себя, приложи фото и загрузи обратно.
        Файл перекрывает встроенную карточку. Картинки сжимаются и складываются в
        архив сайта.
      </p>
      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link href="/" className="text-accent underline underline-offset-4">
          К карте
        </Link>
        <button
          type="button"
          className="text-accent underline underline-offset-4"
          onClick={() => downloadSlug("_template")}
        >
          Скачать шаблон
        </button>
      </div>

      <form
        className="mt-8 border border-[color:var(--rule)] px-4 py-4"
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          void uploadRow("new", new FormData(form), setStatuses, () => {
            router.refresh();
          });
        }}
      >
        <p className="text-[11px] tracking-[0.16em] text-muted uppercase">Любой файл</p>
        <p className="mt-1 text-sm text-ink-soft">
          Можно не привязывать к строке ниже: slug читается из шапки Markdown.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="flex-1 text-xs text-ink-soft">
            Markdown
            <input
              name="markdown"
              type="file"
              accept=".md,text/markdown"
              required
              className="mt-1 block w-full text-xs"
            />
          </label>
          <label className="flex-1 text-xs text-ink-soft">
            Картинки
            <input
              name="images"
              type="file"
              accept="image/*"
              multiple
              className="mt-1 block w-full text-xs"
            />
          </label>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center bg-accent px-3 text-xs tracking-[0.12em] text-paper uppercase"
          >
            Загрузить
          </button>
        </div>
        {statuses.new?.text ? (
          <p className={`mt-2 text-sm ${statuses.new.state === "error" ? "text-accent" : "text-ink-soft"}`}>
            {statuses.new.text}
          </p>
        ) : null}
      </form>

      <label className="mt-8 block">
        <span className="text-[11px] tracking-[0.16em] text-muted uppercase">Поиск</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Франция, zazous, Молодая гвардия"
          className="mt-2 w-full border border-[color:var(--rule)] bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </label>

      <ul className="mt-8 space-y-4">
        {rows.map((movement) => {
          const status = statuses[movement.slug] ?? { state: "idle" };
          return (
            <li
              key={movement.slug}
              className="border border-[color:var(--rule)] px-4 py-4"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="text-[11px] tracking-[0.14em] text-muted uppercase">
                    {movement.historicalCountryName}
                  </p>
                  <h2 className="font-display text-2xl leading-tight">{movement.title}</h2>
                  <p className="mt-1 text-sm text-ink-soft">{movement.slug}</p>
                </div>
                <Link
                  href={`/country/${movement.slug}`}
                  className="text-xs tracking-[0.12em] text-accent uppercase underline underline-offset-4"
                >
                  Открыть
                </Link>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => downloadSlug(movement.slug)}
                  className="inline-flex min-h-11 items-center justify-center border border-accent px-3 text-xs tracking-[0.12em] text-accent uppercase"
                >
                  Скачать MD
                </button>
                <form
                  className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const form = event.currentTarget;
                    void uploadRow(movement.slug, new FormData(form), setStatuses, () => {
                      router.refresh();
                    });
                  }}
                >
                  <label className="flex-1 text-xs text-ink-soft">
                    Markdown
                    <input
                      name="markdown"
                      type="file"
                      accept=".md,text/markdown"
                      required
                      className="mt-1 block w-full text-xs"
                    />
                  </label>
                  <label className="flex-1 text-xs text-ink-soft">
                    Картинки
                    <input
                      name="images"
                      type="file"
                      accept="image/*"
                      multiple
                      className="mt-1 block w-full text-xs"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={status.state === "busy"}
                    className="inline-flex min-h-11 items-center justify-center bg-accent px-3 text-xs tracking-[0.12em] text-paper uppercase disabled:opacity-60"
                  >
                    {status.state === "busy" ? "Пишу…" : "Загрузить"}
                  </button>
                </form>
              </div>
              {status.text ? (
                <p
                  className={`mt-2 text-sm ${
                    status.state === "error" ? "text-accent" : "text-ink-soft"
                  }`}
                >
                  {status.text}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

async function downloadSlug(slug: string) {
  const response = await fetch(`/api/content/${slug}`);
  const data = (await response.json()) as { markdown?: string; filename?: string; error?: string };
  if (!response.ok || !data.markdown) {
    window.alert(data.error ?? "Не удалось скачать файл.");
    return;
  }
  const blob = new Blob([data.markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = data.filename ?? `${slug}.md`;
  link.click();
  URL.revokeObjectURL(url);
}

async function uploadRow(
  slug: string,
  form: FormData,
  setStatuses: Dispatch<SetStateAction<Record<string, RowStatus>>>,
  onDone: () => void,
) {
  setStatuses((current) => ({ ...current, [slug]: { state: "busy", text: "Сохраняю…" } }));
  const response = await fetch("/api/content/import", {
    method: "POST",
    body: form,
  });
  const data = (await response.json()) as { error?: string; images?: number; slug?: string };
  if (!response.ok) {
    setStatuses((current) => ({
      ...current,
      [slug]: { state: "error", text: data.error ?? "Ошибка загрузки." },
    }));
    return;
  }
  setStatuses((current) => ({
    ...current,
    [slug]: {
      state: "ok",
      text: `Готово: ${data.slug}. Картинок в галерее: ${data.images ?? 0}.`,
    },
  }));
  onDone();
}
