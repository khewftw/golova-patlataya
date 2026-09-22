"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

type MovementModalProps = {
  title: string;
  children: React.ReactNode;
};

export function MovementModal({ title, children }: MovementModalProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        router.back();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [router]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6">
      <button
        type="button"
        aria-label="Закрыть"
        className="absolute inset-0 bg-[color:var(--backdrop)]"
        onClick={() => router.back()}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex max-h-[94vh] w-full flex-col overflow-hidden border border-[color:var(--rule)] bg-paper shadow-[0_24px_80px_rgba(28,22,18,0.28)] md:max-h-[90vh] md:w-[min(1000px,calc(100vw-3rem))]"
      >
        <div className="flex items-center justify-between border-b border-[color:var(--rule)] px-4 py-3 md:px-6">
          <p className="text-[11px] tracking-[0.18em] text-muted uppercase">История</p>
          <button
            ref={closeRef}
            type="button"
            data-close
            onClick={() => router.back()}
            className="grid size-10 place-items-center rounded-sm border border-[color:var(--rule)]"
            aria-label="Закрыть"
          >
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto px-4 py-5 md:px-8 md:py-7">{children}</div>
      </div>
    </div>
  );
}
