"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Reveal } from "@/components/reveal";
import {
  CONTACT,
  PROPERTIES,
  coverPhoto,
  type PropertyOperation,
} from "@/data/properties";

type Filter = "todas" | PropertyOperation;

export function Listings() {
  const [filter, setFilter] = useState<Filter>("todas");

  const items = useMemo(() => {
    if (filter === "todas") return PROPERTIES;
    return PROPERTIES.filter((p) => p.operation === filter);
  }, [filter]);

  return (
    <section
      id="propiedades"
      className="border-y border-border bg-mist/70 py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <p className="text-sm tracking-[0.2em] text-forest uppercase">
              Propiedades
            </p>
            <h2 className="mt-3 font-display text-4xl tracking-tight text-forest-deep md:text-5xl">
              Selección destacada
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Tocá una ficha para ver la galería completa, descripción y
              amenities. Disponibilidad real por WhatsApp.
            </p>
          </Reveal>

          <div className="flex flex-wrap gap-2">
            {(
              [
                ["todas", "Todas"],
                ["venta", "Venta"],
                ["alquiler", "Alquiler"],
              ] as const
            ).map(([value, label]) => {
              const active = filter === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  aria-pressed={active}
                  className={
                    active
                      ? "inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
                      : "inline-flex h-9 items-center rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-muted"
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="mt-14 rounded-lg border border-dashed border-border bg-background/70 px-6 py-12 text-center">
            <p className="font-heading text-xl text-forest-deep">
              No hay propiedades en este filtro
            </p>
            <button
              type="button"
              className="mt-5 text-sm font-medium text-forest underline underline-offset-4"
              onClick={() => setFilter("todas")}
            >
              Ver todas
            </button>
          </div>
        ) : (
          <ul className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((property, index) => {
              const cover = coverPhoto(property);
              const wa = `${CONTACT.whatsappUrl}?text=${encodeURIComponent(
                `Hola Mariana, me interesa: ${property.title} (${property.location}).`
              )}`;
              return (
                <Reveal key={property.id} delayMs={index * 50}>
                  <li className="group">
                    <article className="h-full">
                      <Link
                        href={`/propiedades/${property.slug}`}
                        className="block"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <Image
                            src={cover.src}
                            alt={cover.alt}
                            fill
                            className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-forest-deep/80 to-transparent p-3 pt-12">
                            <span className="rounded bg-white/95 px-2 py-1 text-[11px] font-medium tracking-wide text-forest-deep uppercase">
                              {property.operation}
                            </span>
                            <span className="rounded bg-black/45 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                              {property.photos.length} fotos
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 space-y-1.5">
                          <p className="text-xs tracking-[0.16em] text-forest uppercase">
                            {property.type}
                            {property.highlight
                              ? ` · ${property.highlight}`
                              : ""}
                          </p>
                          <h3 className="font-heading text-xl text-forest-deep transition group-hover:text-forest">
                            {property.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {property.location}
                          </p>
                          <p className="pt-1 font-medium text-foreground">
                            {property.priceLabel}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {property.areaLabel}
                            {property.beds != null
                              ? ` · ${property.beds} dorm.`
                              : ""}
                            {property.baths != null
                              ? ` · ${property.baths} baños`
                              : ""}
                          </p>
                          <p className="pt-2 text-sm font-medium text-forest">
                            Ver ficha y galería →
                          </p>
                        </div>
                      </Link>
                      <a
                        href={wa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex pt-2 text-sm text-muted-foreground underline decoration-border underline-offset-4 transition hover:text-forest hover:decoration-forest"
                      >
                        Consultar por WhatsApp
                      </a>
                    </article>
                  </li>
                </Reveal>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
