import Image from "next/image";
import { ImageCredit } from "@/components/movement/ImageCredit";
import type { HistoricalImage } from "@/types/movement";

type GalleryProps = {
  images: HistoricalImage[];
  compact?: boolean;
};

export function Gallery({ images, compact = false }: GalleryProps) {
  if (images.length === 0) return null;

  return (
    <section className="mt-8">
      <p className="text-[11px] tracking-[0.18em] text-muted uppercase">
        Архивные кадры
      </p>
      <div className="gallery-row mt-3 flex gap-3 overflow-x-auto pb-2">
        {images.map((image) => (
          <figure
            key={image.src}
            className={`relative shrink-0 overflow-hidden bg-paper-deep ${
              compact ? "w-56" : "w-72 md:w-80"
            }`}
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes={compact ? "224px" : "320px"}
                className="object-cover"
                loading="lazy"
              />
            </div>
            <div className="px-2 pb-2">
              <ImageCredit image={image} compact />
            </div>
          </figure>
        ))}
      </div>
    </section>
  );
}
