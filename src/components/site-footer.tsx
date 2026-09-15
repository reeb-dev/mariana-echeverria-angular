import { CONTACT } from "@/data/properties";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-forest-deep text-white/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[1.2fr_1fr_1fr] md:px-8">
        <div>
          <p className="font-display text-2xl text-white">{CONTACT.brand}</p>
          <p className="mt-1 text-sm tracking-[0.14em] text-stone-warm uppercase">
            {CONTACT.tagline}
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            Corredora, tasadora y martillera pública. {CONTACT.matricula}.
            Servicio personalizado en Zona Norte, CABA y Coronel Suárez.
          </p>
        </div>

        <div>
          <p className="text-xs tracking-[0.16em] text-white/45 uppercase">
            Explorar
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href="#servicios" className="transition hover:text-stone-warm">
                Servicios
              </a>
            </li>
            <li>
              <a
                href="#propiedades"
                className="transition hover:text-stone-warm"
              >
                Propiedades
              </a>
            </li>
            <li>
              <a href="#proceso" className="transition hover:text-stone-warm">
                Proceso
              </a>
            </li>
            <li>
              <a href="#faq" className="transition hover:text-stone-warm">
                FAQ
              </a>
            </li>
            <li>
              <a href="#contacto" className="transition hover:text-stone-warm">
                Contacto
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs tracking-[0.16em] text-white/45 uppercase">
            Contacto
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a
                href={CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-stone-warm"
              >
                WhatsApp {CONTACT.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${CONTACT.email}`}
                className="transition hover:text-stone-warm"
              >
                {CONTACT.email}
              </a>
            </li>
            <li>
              <a
                href={CONTACT.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-stone-warm"
              >
                @{CONTACT.instagram}
              </a>
            </li>
            {CONTACT.offices.map((office) => (
              <li key={office.name} className="pt-1 text-white/55">
                {office.name}: {office.address}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-5 py-4 text-xs text-white/45 md:px-8">
          Demo de rediseño — no es el sitio oficial. Datos de contacto tomados
          de www.marianaecheverria.com.ar · {CONTACT.matricula} · COPYRIGHT{" "}
          {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
