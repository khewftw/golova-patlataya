import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MovementContent } from "@/components/movement/MovementContent";
import { MovementPage } from "@/components/movement/MovementPage";
import { SITE } from "@/data/site";
import { getAllMovements, getMovement } from "@/lib/movements";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

type CountryPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllMovements().map((movement) => ({ slug: movement.slug }));
}

export async function generateMetadata({
  params,
}: CountryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const movement = getMovement(slug);
  if (!movement) return {};

  const title = `${movement.title} — ${SITE.fullTitle}`;
  const description = movement.shortDescription;

  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      locale: "ru_RU",
      type: "article",
    },
  };
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { slug } = await params;
  const movement = getMovement(slug);
  if (!movement) notFound();

  return (
    <MovementPage>
      <MovementContent movement={movement} variant="page" />
    </MovementPage>
  );
}
