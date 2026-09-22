import { NextResponse } from "next/server";
import { applyMovementMarkdown } from "@/lib/content-store";

export const runtime = "nodejs";

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif|tiff?|svg)$/i;

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const markdownFile = form.get("markdown");
    if (!(markdownFile instanceof File) || markdownFile.size === 0) {
      return NextResponse.json({ error: "Приложи .md файл." }, { status: 400 });
    }
    if (markdownFile.size > 2_000_000) {
      return NextResponse.json({ error: "Markdown больше 2 МБ." }, { status: 400 });
    }

    const markdown = await markdownFile.text();
    const uploads = [];
    for (const [key, value] of form.entries()) {
      if (key !== "images" && key !== "image") continue;
      if (!(value instanceof File) || value.size === 0) continue;
      if (!IMAGE_EXT.test(value.name)) {
        return NextResponse.json(
          { error: `Не картинка: ${value.name}` },
          { status: 400 },
        );
      }
      if (value.size > 8_000_000) {
        return NextResponse.json(
          { error: `${value.name} больше 8 МБ. Сожми файл и загрузи снова.` },
          { status: 400 },
        );
      }
      uploads.push({
        filename: value.name,
        buffer: Buffer.from(await value.arrayBuffer()),
      });
    }

    const result = await applyMovementMarkdown({ markdown, uploads });
    return NextResponse.json({
      ok: true,
      slug: result.slug,
      images: result.images,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось загрузить файл.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
