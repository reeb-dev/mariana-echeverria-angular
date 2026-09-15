import Image from "next/image";
import { Reveal } from "@/components/reveal";
import { CONTACT, CREDENTIALS } from "@/data/properties";

export function About() {
  return (
    <section
      id="trayectoria"
      className="border-y border-border bg-mist/50 py-20 md:py-28"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <Reveal>
          <div className="relative aspect-[4/5] overflow-hidden md:aspect-[5/6]">
            <Image
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1000&q=80"
              alt="Retrato profesional de referencia para la demo"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/50 to-transparent" />
            <p className="absolute bottom-5 left-5 right-5 font-display text-3xl text-white md:text-4xl">
              {CONTACT.years}
              <span className="mt-1 block font-sans text-sm tracking-[0.18em] text-stone-warm uppercase">
                años de oficio
              </span>
            </p>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <p className="text-sm tracking-[0.2em] text-forest uppercase">
              Trayectoria
            </p>
            <h2 className="mt-3 font-display text-4xl tracking-tight text-forest-deep md:text-5xl">
              Mariana Laura Echeverría
            </h2>
            <p className="mt-6 max-w-xl leading-relaxed text-muted-foreground">
              Abogada (UBA, 1998). Corredora inmobiliaria, tasadora y martillera
              pública ({CONTACT.matricula}), egresada de la Cámara Inmobiliaria
              Argentina junto a la Universidad de Morón. Especialización en
              negociación y mediación.
            </p>
            <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
              Servicio profesional personalizado, honesto y orientado al cliente:
              viviendas, locales, campos, lotes y desarrollos en Zona Norte del
              GBA, CABA y el sudoeste bonaerense.
            </p>
          </Reveal>

          <Reveal delayMs={80}>
            <ul className="mt-8 space-y-3 border-l border-forest/25 pl-5">
              {CREDENTIALS.map((item) => (
                <li key={item} className="text-sm leading-relaxed text-foreground/90">
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delayMs={120}>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {CONTACT.offices.map((office) => (
                <div key={office.name}>
                  <h3 className="font-heading text-lg text-forest-deep">
                    {office.name}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {office.address}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/80">
                    {office.detail}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
