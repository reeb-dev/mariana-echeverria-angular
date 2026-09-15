"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Reveal } from "@/components/reveal";
import {
  PROPERTIES,
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
      className="border-y border-border bg-mist/60 py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal>
          <p className="text-sm tracking-[0.2em] text-forest uppercase">
            Propiedades
          </p>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-forest-deep md:text-5xl">
            Selección destacada
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Casos de muestra para esta demo. Consultá disponibilidad real por
            WhatsApp o Instagram.
          </p>
        </Reveal>

        <div className="mt-8 flex flex-wrap gap-2">
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
                    ? "inline-flex h-8 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
                    : "inline-flex h-8 items-center rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-muted"
                }
              >
                {label}
              </button>
            );
          })}
        </div>

        {items.length === 0 ? (
          <p className="mt-12 text-muted-foreground">
            No hay propiedades para este filtro.
          </p>
        ) : (
          <ul className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((property, index) => (
              <Reveal key={property.id} delayMs={index * 70}>
                <li className="group">
                  <article>
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={property.image}
                        alt={property.imageAlt}
                        fill
                        className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                    <div className="mt-4 space-y-1.5">
                      <p className="text-xs tracking-[0.16em] text-forest uppercase">
                        {property.operation} · {property.type}
                      </p>
                      <h3 className="font-heading text-xl text-forest-deep">
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
                        {property.beds != null ? ` · ${property.beds} dorm.` : ""}
                        {property.baths != null ? ` · ${property.baths} baños` : ""}
                      </p>
                    </div>
                  </article>
                </li>
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
