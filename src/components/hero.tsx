import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { CONTACT } from "@/data/properties";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-[100svh] items-end overflow-hidden"
    >
      <Image
        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80"
        alt="Residencia contemporánea con jardín, luz de tarde"
        fill
        priority
        className="animate-hero-image object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/95 via-forest-deep/55 to-forest-deep/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.78_0.035_85_/_0.22),transparent_55%)]" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-16 pt-32 md:px-8 md:pb-24">
        <p
          className="animate-hero-rise text-sm tracking-[0.22em] text-stone-warm uppercase"
          style={{ animationDelay: "40ms" }}
        >
          {CONTACT.matricula} · {CONTACT.years} años
        </p>
        <p
          className="animate-hero-rise mt-4 font-display text-5xl leading-[0.95] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl"
          style={{ animationDelay: "100ms" }}
        >
          {CONTACT.brand}
        </p>
        <p
          className="animate-hero-rise mt-2 font-sans text-lg tracking-[0.18em] text-stone-warm uppercase md:text-xl"
          style={{ animationDelay: "180ms" }}
        >
          {CONTACT.tagline}
        </p>
        <h1
          className="animate-hero-rise mt-8 max-w-xl font-heading text-2xl leading-snug text-white/95 md:text-3xl"
          style={{ animationDelay: "280ms" }}
        >
          Tasaciones reales. Acompañamiento de punta a punta.
        </h1>
        <p
          className="animate-hero-rise mt-4 max-w-lg text-base leading-relaxed text-white/80 md:text-lg"
          style={{ animationDelay: "360ms" }}
        >
          Corredora, tasadora y martillera pública. Venta, alquiler, desarrollos
          y asesoría jurídica en Zona Norte, CABA y Coronel Suárez.
        </p>
        <div
          className="animate-hero-rise mt-8 flex flex-wrap gap-3"
          style={{ animationDelay: "460ms" }}
        >
          <a
            href="#contacto"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-11 rounded-md bg-stone-warm px-5 text-forest-deep hover:bg-stone-warm/90"
            )}
          >
            Pedí tu tasación
          </a>
          <a
            href="#propiedades"
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "h-11 rounded-md border-white/40 bg-transparent px-5 text-white hover:bg-white/10 hover:text-white"
            )}
          >
            Ver propiedades
          </a>
          <a
            href={CONTACT.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ size: "lg", variant: "ghost" }),
              "h-11 rounded-md px-4 text-white/90 hover:bg-white/10 hover:text-white"
            )}
          >
            @{CONTACT.instagram}
          </a>
        </div>
      </div>
    </section>
  );
}
