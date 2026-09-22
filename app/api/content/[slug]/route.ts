import { NextResponse } from "next/server";
import { serializeMovementMarkdown } from "@/lib/content-markdown";
import { getMovement } from "@/lib/movements";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { slug } = await params;
  if (slug === "_template") {
    const { readFile } = await import("node:fs/promises");
    const { join } = await import("node:path");
    const markdown = await readFile(
      join(process.cwd(), "content", "movements", "_template.md"),
      "utf8",
    );
    return NextResponse.json({ slug, filename: "_template.md", markdown });
  }

  const movement = getMovement(slug);
  if (!movement) {
    return NextResponse.json({ error: "История не найдена." }, { status: 404 });
  }

  return NextResponse.json({
    slug: movement.slug,
    filename: `${movement.slug}.md`,
    markdown: serializeMovementMarkdown(movement),
  });
}
