import { Reveal } from "@/components/reveal";
import { TESTIMONIALS } from "@/data/properties";

export function Testimonials() {
  return (
    <section
      id="testimonios"
      className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28"
      aria-labelledby="testimonios-title"
    >
      <Reveal>
        <p className="text-sm tracking-[0.2em] text-forest uppercase">
          Voces
        </p>
        <h2
          id="testimonios-title"
          className="mt-3 max-w-2xl font-display text-4xl tracking-tight text-forest-deep md:text-5xl"
        >
          Confianza construida operación a operación
        </h2>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Testimonios de muestra para la demo, inspirados en el tipo de
          acompañamiento que brinda el estudio.
        </p>
      </Reveal>

      <ul className="mt-14 grid gap-8 md:grid-cols-3">
        {TESTIMONIALS.map((item, index) => (
          <Reveal key={item.name} delayMs={index * 80}>
            <li className="flex h-full flex-col border-t border-border pt-6">
              <blockquote className="flex-1 font-heading text-xl leading-snug text-forest-deep">
                “{item.quote}”
              </blockquote>
              <footer className="mt-6 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{item.name}</p>
                <p>{item.place}</p>
              </footer>
            </li>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
