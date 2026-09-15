import { Reveal } from "@/components/reveal";
import { PROCESS } from "@/data/properties";

export function Process() {
  return (
    <section id="proceso" className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
      <Reveal>
        <p className="text-sm tracking-[0.2em] text-forest uppercase">
          Proceso
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl tracking-tight text-forest-deep md:text-5xl">
          Cómo trabajamos con vos
        </h2>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Un método claro, sin sorpresas: del primer llamado al cierre.
        </p>
      </Reveal>

      <ol className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {PROCESS.map((item, index) => (
          <Reveal key={item.step} delayMs={index * 70}>
            <li className="relative">
              <p className="font-display text-4xl text-stone-warm">{item.step}</p>
              <h3 className="mt-4 font-heading text-2xl text-forest-deep">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
