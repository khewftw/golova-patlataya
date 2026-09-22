import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import { SITE } from "@/data/site";
import "./globals.css";

const sans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const display = Source_Serif_4({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: SITE.fullTitle,
    template: `%s — ${SITE.fullTitle}`,
  },
  description: SITE.description,
  authors: [{ name: SITE.author }],
  openGraph: {
    title: SITE.fullTitle,
    description: SITE.description,
    locale: "ru_RU",
    type: "website",
  },
};

export default function RootLayout({
  children,
  modal,
}: LayoutProps<"/"> & { modal?: ReactNode }) {
  return (
    <html
      lang="ru"
      className={`${sans.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-paper font-sans text-ink">
        {children}
        {modal}
      </body>
    </html>
  );
}
