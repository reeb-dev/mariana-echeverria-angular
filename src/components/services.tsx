import { Reveal } from "@/components/reveal";
import { SERVICES } from "@/data/properties";

export function Services() {
  return (
    <section id="servicios" className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
      <Reveal>
        <p className="text-sm tracking-[0.2em] text-forest uppercase">
          Servicios
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl tracking-tight text-forest-deep md:text-5xl">
          Un equipo para cada decisión inmobiliaria
        </h2>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Intermediación, valuación y acompañamiento jurídico con más de 25 años
          de trayectoria profesional.
        </p>
      </Reveal>

      <ul className="mt-14 space-y-0 divide-y divide-border border-y border-border">
        {SERVICES.map((service, index) => (
          <Reveal key={service.title} delayMs={index * 60}>
            <li className="grid gap-3 py-7 md:grid-cols-[minmax(12rem,18rem)_1fr] md:gap-10">
              <h3 className="font-heading text-xl text-forest-deep md:text-2xl">
                {service.title}
              </h3>
              <p className="max-w-2xl leading-relaxed text-muted-foreground">
                {service.description}
              </p>
            </li>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
