import { notFound } from "next/navigation";
import { MovementContent } from "@/components/movement/MovementContent";
import { MovementModal } from "@/components/movement/MovementModal";
import { getAllMovements, getMovement } from "@/lib/movements";

type ModalPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllMovements().map((movement) => ({ slug: movement.slug }));
}

export default async function CountryModalPage({ params }: ModalPageProps) {
  const { slug } = await params;
  const movement = getMovement(slug);
  if (!movement) notFound();

  return (
    <MovementModal title={movement.title}>
      <MovementContent movement={movement} variant="modal" />
    </MovementModal>
  );
}
