import { HistoricalMapClient } from "@/components/map/HistoricalMapClient";
import { getMovementSummaries } from "@/lib/movements";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <HistoricalMapClient
      movements={getMovementSummaries()}
      editorHref={process.env.NODE_ENV !== "production" ? "/edit" : undefined}
    />
  );
}
