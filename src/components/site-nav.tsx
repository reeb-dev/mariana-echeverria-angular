"use client";

import { useEffect, useState } from "react";
import { CONTACT } from "@/data/properties";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#servicios", label: "Servicios" },
  { href: "#propiedades", label: "Propiedades" },
  { href: "#proceso", label: "Proceso" },
  { href: "#trayectoria", label: "Trayectoria" },
  { href: "#contacto", label: "Contacto" },
] as const;

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        scrolled || open
          ? "border-b border-border/70 bg-background/90 text-foreground shadow-sm backdrop-blur-md"
          : "bg-transparent text-white"
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
        <a
          href="#inicio"
          className="font-display text-xl tracking-tight md:text-2xl"
          onClick={() => setOpen(false)}
        >
          {CONTACT.brand}
        </a>

        <nav
          aria-label="Principal"
          className="hidden items-center gap-7 text-sm md:flex"
        >
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "transition",
                scrolled ? "text-foreground/75 hover:text-foreground" : "text-white/85 hover:text-white"
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={CONTACT.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition",
              scrolled || open
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border border-white/35 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
            )}
          >
            WhatsApp
          </a>
          <button
            type="button"
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-md border md:hidden",
              scrolled || open
                ? "border-border text-foreground"
                : "border-white/35 text-white"
            )}
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menú</span>
            <span className="flex flex-col gap-1.5">
              <span
                className={cn(
                  "block h-0.5 w-4 bg-current transition",
                  open && "translate-y-2 rotate-45"
                )}
              />
              <span
                className={cn(
                  "block h-0.5 w-4 bg-current transition",
                  open && "opacity-0"
                )}
              />
              <span
                className={cn(
                  "block h-0.5 w-4 bg-current transition",
                  open && "-translate-y-2 -rotate-45"
                )}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        id="menu-movil"
        hidden={!open}
        className="border-t border-border bg-background md:hidden"
      >
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4 text-foreground">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-2 py-3 text-base hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href={CONTACT.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md px-2 py-3 text-base text-forest hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            Instagram @{CONTACT.instagram}
          </a>
        </nav>
      </div>
    </header>
  );
}
