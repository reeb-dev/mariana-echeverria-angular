import { Reveal } from "@/components/reveal";
import { buttonVariants } from "@/components/ui/button";
import { CONTACT } from "@/data/properties";
import { cn } from "@/lib/utils";

export function InstagramCta() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl bg-forest px-6 py-12 md:px-12 md:py-14">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-stone-warm/20 blur-2xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl text-primary-foreground">
              <p className="text-sm tracking-[0.2em] text-stone-warm uppercase">
                Instagram
              </p>
              <h2 className="mt-3 font-display text-3xl tracking-tight md:text-4xl">
                Seguí el día a día de la inmobiliaria
              </h2>
              <p className="mt-3 text-white/75">
                Novedades, avisos y detrás de escena en @
                {CONTACT.instagram}.
              </p>
            </div>
            <a
              href={CONTACT.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 rounded-md bg-stone-warm px-5 text-forest-deep hover:bg-stone-warm/90"
              )}
            >
              Abrir Instagram
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
