import { Reveal } from "@/components/reveal";
import { CONTACT } from "@/data/properties";

export function About() {
  return (
    <section id="trayectoria" className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
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
            Servicio profesional personalizado, honesto y orientado al cliente
            desde hace más de 25 años: viviendas, locales, campos, lotes y
            desarrollos en Zona Norte del GBA, CABA y el sudoeste bonaerense.
          </p>
        </Reveal>

        <Reveal delayMs={120}>
          <div className="space-y-8 border-l border-border pl-6 md:pl-8">
            <div>
              <h3 className="font-heading text-lg text-forest-deep">Sedes</h3>
              <ul className="mt-4 space-y-4">
                {CONTACT.offices.map((office) => (
                  <li key={office.name}>
                    <p className="font-medium text-foreground">{office.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {office.address}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-heading text-lg text-forest-deep">Contacto</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href={`tel:+549${CONTACT.phoneDisplay.replace(/\s/g, "")}`}
                    className="transition hover:text-forest"
                  >
                    {CONTACT.phoneDisplay}
                  </a>
                  {" / "}
                  {CONTACT.phoneSecondary}
                </li>
                <li>
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="transition hover:text-forest"
                  >
                    {CONTACT.email}
                  </a>
                </li>
                <li>
                  <a
                    href={CONTACT.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-forest"
                  >
                    @{CONTACT.instagram}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
