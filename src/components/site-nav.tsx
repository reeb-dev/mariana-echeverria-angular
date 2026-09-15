import { CONTACT } from "@/data/properties";

export function SiteNav() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
        <a href="#inicio" className="text-white/95 transition hover:text-white">
          <span className="font-display text-xl tracking-tight md:text-2xl">
            {CONTACT.brand}
          </span>
        </a>
        <nav
          aria-label="Principal"
          className="hidden items-center gap-7 text-sm text-white/85 md:flex"
        >
          <a href="#servicios" className="transition hover:text-white">
            Servicios
          </a>
          <a href="#propiedades" className="transition hover:text-white">
            Propiedades
          </a>
          <a href="#trayectoria" className="transition hover:text-white">
            Trayectoria
          </a>
          <a href="#contacto" className="transition hover:text-white">
            Contacto
          </a>
        </nav>
        <a
          href={CONTACT.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-white/35 bg-white/10 px-3 py-1.5 text-sm text-white backdrop-blur-sm transition hover:bg-white/20"
        >
          WhatsApp
        </a>
      </div>
    </header>
  );
}
