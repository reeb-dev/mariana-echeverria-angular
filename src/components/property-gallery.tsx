"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { PropertyPhoto } from "@/data/properties";
import { cn } from "@/lib/utils";

type PropertyGalleryProps = {
  photos: PropertyPhoto[];
  title: string;
};

export function PropertyGallery({ photos, title }: PropertyGalleryProps) {
  const [active, setActive] = useState(0);
  const current = photos[active] ?? photos[0];

  const go = useCallback(
    (dir: -1 | 1) => {
      setActive((i) => (i + dir + photos.length) % photos.length);
    },
    [photos.length]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (!current) return null;

  return (
    <div className="space-y-4">
      <div className="relative aspect-[16/10] overflow-hidden bg-mist md:aspect-[16/9]">
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 70vw"
        />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-forest-deep/85 to-transparent p-4 pt-16 text-white">
          <div>
            <p className="text-sm font-medium">{current.caption}</p>
            <p className="text-xs text-white/70">
              Foto {active + 1} de {photos.length} · {title}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              className="rounded-md border border-white/35 bg-white/10 px-3 py-1.5 text-sm backdrop-blur-sm hover:bg-white/20"
              aria-label="Foto anterior"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="rounded-md border border-white/35 bg-white/10 px-3 py-1.5 text-sm backdrop-blur-sm hover:bg-white/20"
              aria-label="Foto siguiente"
            >
              →
            </button>
          </div>
        </div>
      </div>

      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {photos.map((photo, index) => (
          <li key={photo.src}>
            <button
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Ver ${photo.caption}`}
              aria-current={index === active}
              className={cn(
                "relative aspect-[4/3] w-full overflow-hidden ring-offset-2 transition",
                index === active
                  ? "ring-2 ring-forest"
                  : "opacity-80 hover:opacity-100"
              )}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover"
                sizes="160px"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
