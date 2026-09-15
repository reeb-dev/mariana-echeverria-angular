import { NgClass } from '@angular/common';
import { Component, HostListener, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONTACT } from '../data/properties';

@Component({
  selector: 'app-site-nav',
  standalone: true,
  imports: [RouterLink, NgClass],
  template: `
    <header
      class="fixed inset-x-0 top-0 z-40 transition-all duration-300"
      [ngClass]="
        scrolled() || open()
          ? 'border-b border-border/70 bg-background/90 text-foreground shadow-sm backdrop-blur-md'
          : 'bg-transparent text-white'
      "
    >
      <div class="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
        <a routerLink="/" fragment="inicio" class="font-display text-xl tracking-tight md:text-2xl">
          {{ contact.brand }}
        </a>

        <nav aria-label="Principal" class="hidden items-center gap-7 text-sm md:flex">
          @for (link of links; track link.href) {
            <a
              [routerLink]="'/'"
              [fragment]="link.fragment"
              class="transition"
              [ngClass]="
                scrolled()
                  ? 'text-foreground/75 hover:text-foreground'
                  : 'text-white/85 hover:text-white'
              "
            >
              {{ link.label }}
            </a>
          }
        </nav>

        <div class="flex items-center gap-2">
          <a
            [href]="contact.whatsappUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="rounded-md px-3 py-1.5 text-sm transition"
            [ngClass]="
              scrolled() || open()
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'border border-white/35 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20'
            "
          >
            WhatsApp
          </a>
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-md border md:hidden"
            [ngClass]="
              scrolled() || open()
                ? 'border-border text-foreground'
                : 'border-white/35 text-white'
            "
            [attr.aria-expanded]="open()"
            aria-controls="menu-movil"
            [attr.aria-label]="open() ? 'Cerrar menú' : 'Abrir menú'"
            (click)="toggleMenu()"
          >
            <span class="sr-only">Menú</span>
            ☰
          </button>
        </div>
      </div>

      @if (open()) {
        <div id="menu-movil" class="border-t border-border bg-background md:hidden">
          <nav class="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4 text-foreground">
            @for (link of links; track link.href) {
              <a
                [routerLink]="'/'"
                [fragment]="link.fragment"
                class="rounded-md px-2 py-3 text-base hover:bg-muted"
                (click)="open.set(false)"
              >
                {{ link.label }}
              </a>
            }
            <a
              [href]="contact.instagramUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="rounded-md px-2 py-3 text-base text-forest hover:bg-muted"
              (click)="open.set(false)"
            >
              Instagram &#64;{{ contact.instagram }}
            </a>
          </nav>
        </div>
      }
    </header>
  `,
})
export class SiteNavComponent {
  readonly contact = CONTACT;
  readonly open = signal(false);
  readonly scrolled = signal(false);
  readonly links = [
    { href: '#servicios', fragment: 'servicios', label: 'Servicios' },
    { href: '#propiedades', fragment: 'propiedades', label: 'Propiedades' },
    { href: '#proceso', fragment: 'proceso', label: 'Proceso' },
    { href: '#trayectoria', fragment: 'trayectoria', label: 'Trayectoria' },
    { href: '#contacto', fragment: 'contacto', label: 'Contacto' },
  ];

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 24);
  }

  toggleMenu() {
    this.open.update((v) => !v);
  }
}
