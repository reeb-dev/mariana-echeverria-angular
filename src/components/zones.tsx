import { Reveal } from "@/components/reveal";
import { ZONES } from "@/data/properties";

export function Zones() {
  return (
    <section
      aria-label="Zonas de trabajo"
      className="border-b border-border bg-forest-deep text-primary-foreground"
    >
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-2 md:grid-cols-4 md:px-8 md:py-12">
        {ZONES.map((zone, index) => (
          <Reveal key={zone.name} delayMs={index * 50}>
            <div>
              <p className="font-heading text-xl text-stone-warm">{zone.name}</p>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                {zone.detail}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
