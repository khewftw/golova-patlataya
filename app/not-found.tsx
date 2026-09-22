import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-paper px-6 text-center">
      <div>
        <p className="text-[11px] tracking-[0.2em] text-muted uppercase">404</p>
        <h1 className="font-display mt-2 text-4xl">История не найдена</h1>
        <p className="mt-3 max-w-md text-ink-soft">
          Такой страницы нет в атласе 1940–1950. Вернитесь к карте и выберите одну
          из тридцати историй.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center text-sm tracking-[0.14em] text-accent uppercase underline underline-offset-4"
        >
          К карте
        </Link>
      </div>
    </main>
  );
}
