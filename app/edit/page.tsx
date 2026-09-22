import type { Metadata } from "next";
import { ContentDesk } from "@/components/content/ContentDesk";
import { getAllMovements } from "@/lib/movements";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Загрузка материалов",
  robots: { index: false, follow: false },
};

export default function EditPage() {
  const movements = getAllMovements();
  return (
    <main>
      <ContentDesk movements={movements} />
    </main>
  );
}
