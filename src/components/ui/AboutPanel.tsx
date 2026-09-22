"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { CSHAPES_ATTRIBUTION, SITE } from "@/data/site";

type AboutPanelProps = {
  open: boolean;
  onClose: () => void;
};

export function AboutPanel({ open, onClose }: AboutPanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 md:items-center md:p-6">
      <button
        type="button"
        aria-label="Закрыть"
        className="absolute inset-0 bg-[color:var(--backdrop)]"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-title"
        className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto border border-[color:var(--rule)] bg-paper px-6 py-6 shadow-[0_24px_80px_rgba(28,22,18,0.28)] md:px-10 md:py-9"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 grid size-10 place-items-center rounded-sm border border-[color:var(--rule)]"
          aria-label="Закрыть"
        >
          <X size={16} />
        </button>
        <p className="text-[11px] tracking-[0.2em] text-muted uppercase">О проекте</p>
        <h2 id="about-title" className="font-display mt-2 text-3xl md:text-4xl">
          {SITE.fullTitle}
        </h2>
        <div className="mt-6 space-y-4 text-[15px] leading-7 text-ink-soft">
          <p>
            Это редакционный атлас, а не учебник и не база данных новостей. На экране —
            историческая политическая карта мира, собранная по снимку границ около{" "}
            <strong className="text-ink">{SITE.snapshotLabel}</strong>.
          </p>
          <p>
            Тридцать историй относятся примерно к 1940–1950 годам. Движение и контур
            государства на карте не всегда совпадают по дате. Swing-Jugend — сюжет
            нацистской Германии до 1945 года, но на карте 1950 года Германия уже разделена:
            оба контура открывают одну статью. Политическая граница не равна ареалу, в
            котором жили и действовали молодые люди.
          </p>
          <p>
            Мы не считаем все тридцать примеров «одним типом организации». Рядом стоят
            подполье, государственные союзы, студенческие федерации и городские
            субкультуры. Если факт спорен, в тексте это сказано прямо.
          </p>
          <p>
            Геометрия границ: {CSHAPES_ATTRIBUTION.citation} Датасет {CSHAPES_ATTRIBUTION.name}{" "}
            распространяется по лицензии{" "}
            <a
              className="underline decoration-accent/40 underline-offset-2 hover:text-accent"
              href={CSHAPES_ATTRIBUTION.licenseUrl}
              target="_blank"
              rel="noreferrer"
            >
              {CSHAPES_ATTRIBUTION.license}
            </a>
            . Страница набора:{" "}
            <a
              className="underline decoration-accent/40 underline-offset-2 hover:text-accent"
              href={CSHAPES_ATTRIBUTION.url}
              target="_blank"
              rel="noreferrer"
            >
              {CSHAPES_ATTRIBUTION.url}
            </a>
            .
          </p>
          <p>
            Изображения — из Wikimedia Commons и связанных архивных собраний. Подписи,
            авторы и лицензии сохраняются у каждой фотографии. Сайт статичен: ни карта, ни
            тексты не запрашиваются из Wikipedia во время просмотра.
          </p>
          <p>{SITE.credit}</p>
        </div>
      </section>
    </div>
  );
}
