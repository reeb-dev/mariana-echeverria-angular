import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PropertyGallery } from "@/components/property-gallery";
import { buttonVariants } from "@/components/ui/button";
import {
  CONTACT,
  PROPERTIES,
  getPropertyBySlug,
} from "@/data/properties";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return PROPERTIES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);
  if (!property) return { title: "Propiedad no encontrada" };
  return {
    title: `${property.title} | ${CONTACT.brand}`,
    description: property.description,
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);
  if (!property) notFound();

  const wa = `${CONTACT.whatsappUrl}?text=${encodeURIComponent(
    `Hola Mariana, vi la ficha de "${property.title}" (${property.location}) y quiero más info.`
  )}`;

  const related = PROPERTIES.filter(
    (p) => p.id !== property.id && p.operation === property.operation
  ).slice(0, 3);

  return (
    <div className="min-h-full bg-background">
      <header className="border-b border-border bg-background/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <Link
            href="/#propiedades"
            className="text-sm text-muted-foreground transition hover:text-forest"
          >
            ← Volver a propiedades
          </Link>
          <Link
            href="/"
            className="font-display text-lg text-forest-deep md:text-xl"
          >
            {CONTACT.brand}
          </Link>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ size: "sm" }),
              "rounded-md bg-primary text-primary-foreground"
            )}
          >
            WhatsApp
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-12">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:gap-12">
          <section aria-label="Galería de fotos">
            <PropertyGallery photos={property.photos} title={property.title} />
          </section>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div>
              <p className="text-xs tracking-[0.18em] text-forest uppercase">
                {property.operation} · {property.type}
              </p>
              <h1 className="mt-2 font-display text-3xl tracking-tight text-forest-deep md:text-4xl">
                {property.title}
              </h1>
              <p className="mt-2 text-muted-foreground">{property.location}</p>
              <p className="mt-4 font-heading text-2xl text-forest-deep">
                {property.priceLabel}
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-3 border-y border-border py-5 text-sm">
              <div>
                <dt className="text-muted-foreground">Superficie</dt>
                <dd className="mt-1 font-medium">{property.areaLabel}</dd>
              </div>
              {property.beds != null ? (
                <div>
                  <dt className="text-muted-foreground">Dormitorios</dt>
                  <dd className="mt-1 font-medium">{property.beds}</dd>
                </div>
              ) : null}
              {property.baths != null ? (
                <div>
                  <dt className="text-muted-foreground">Baños</dt>
                  <dd className="mt-1 font-medium">{property.baths}</dd>
                </div>
              ) : null}
              {property.highlight ? (
                <div>
                  <dt className="text-muted-foreground">Destacado</dt>
                  <dd className="mt-1 font-medium">{property.highlight}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-muted-foreground">Fotos</dt>
                <dd className="mt-1 font-medium">{property.photos.length}</dd>
              </div>
            </dl>

            <div className="flex flex-col gap-3">
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-11 justify-center rounded-md bg-stone-warm text-forest-deep hover:bg-stone-warm/90"
                )}
              >
                Consultar esta propiedad
              </a>
              <a
                href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(
                  `Consulta: ${property.title}`
                )}`}
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "h-11 justify-center rounded-md"
                )}
              >
                Escribir por email
              </a>
            </div>

            <p className="text-xs text-muted-foreground">
              Demo local · {CONTACT.matricula}. Las fotos son de muestra.
            </p>
          </aside>
        </div>

        <section className="mt-14 grid gap-10 border-t border-border pt-12 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="font-heading text-2xl text-forest-deep">
              Descripción
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
              {property.description}
            </p>
          </div>
          <div>
            <h2 className="font-heading text-2xl text-forest-deep">
              Características
            </h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {property.amenities.map((item) => (
                <li
                  key={item}
                  className="border-l border-forest/30 pl-3 text-sm text-foreground/90"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {related.length > 0 ? (
          <section className="mt-16 border-t border-border pt-12">
            <h2 className="font-heading text-2xl text-forest-deep">
              También te puede interesar
            </h2>
            <ul className="mt-8 grid gap-8 sm:grid-cols-3">
              {related.map((item) => {
                const cover = item.photos[0];
                return (
                  <li key={item.id}>
                    <Link
                      href={`/propiedades/${item.slug}`}
                      className="group block"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cover.src}
                          alt={cover.alt}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      </div>
                      <p className="mt-3 text-xs tracking-[0.14em] text-forest uppercase">
                        {item.operation} · {item.photos.length} fotos
                      </p>
                      <h3 className="mt-1 font-heading text-lg text-forest-deep group-hover:text-forest">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.location}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
      </main>
    </div>
  );
}
