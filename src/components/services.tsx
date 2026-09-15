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
          Todo el camino inmobiliario, en un solo estudio
        </h2>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Intermediación, valuación y acompañamiento jurídico con más de 25 años
          de trayectoria profesional.
        </p>
      </Reveal>

      <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service, index) => (
          <Reveal key={service.title} delayMs={index * 60}>
            <li className="group relative h-full border-t border-forest/25 pt-6 transition hover:border-forest">
              <span className="font-display text-3xl text-stone-warm/90 tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-heading text-2xl text-forest-deep">
                {service.title}
              </h3>
              <p className="mt-3 max-w-sm leading-relaxed text-muted-foreground">
                {service.description}
              </p>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
