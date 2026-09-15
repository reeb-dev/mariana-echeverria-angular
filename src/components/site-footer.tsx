import { CONTACT } from "@/data/properties";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-forest-deep text-white/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 md:flex-row md:items-center md:justify-between md:px-8">
        <div>
          <p className="font-display text-lg text-white">{CONTACT.brand}</p>
          <p className="text-sm">
            {CONTACT.tagline} · {CONTACT.matricula}
          </p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <a
            href={CONTACT.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-stone-warm"
          >
            Instagram @{CONTACT.instagram}
          </a>
          <a
            href={CONTACT.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-stone-warm"
          >
            WhatsApp
          </a>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-5 py-4 text-xs text-white/45 md:px-8">
          Demo de rediseño — no es el sitio oficial. Datos de contacto tomados
          de marianaecheverria.com.ar · COPYRIGHT {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
