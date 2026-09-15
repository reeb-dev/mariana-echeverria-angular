import { NgClass } from '@angular/common';
import { Component, HostListener, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONTACT } from '../data/properties';

@Component({
  selector: 'app-site-nav',
  standalone: true,
  imports: [RouterLink, NgClass],
  template: `
    <div class="fixed inset-x-0 top-0 z-40">
      <div class="border-b border-stone-warm/25 bg-forest-deep text-primary-foreground">
        <div
          class="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-1 px-5 py-1.5 text-xs font-medium sm:justify-between md:px-8 md:text-sm"
        >
          <a [href]="phoneTel" class="inline-flex items-center gap-2 transition hover:text-stone-warm">
            <span class="text-stone-warm" aria-hidden>☎</span>
            {{ contact.phoneDisplay }} / {{ contact.phoneSecondary }}
          </a>
          <a [href]="'mailto:' + contact.email" class="inline-flex items-center gap-2 transition hover:text-stone-warm">
            <span class="text-stone-warm" aria-hidden>✉</span>
            {{ contact.email }}
          </a>
        </div>
      </div>

      <header
        class="transition-all duration-300"
        [ngClass]="
          scrolled() || open()
            ? 'border-b border-border/70 bg-background/95 text-foreground shadow-sm backdrop-blur-md'
            : 'bg-background/80 text-foreground backdrop-blur-sm'
        "
      >
        <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 md:px-8">
          <a routerLink="/" fragment="inicio" class="block shrink-0">
            <img
              src="/about/logo-mark.png"
              alt="Mariana Echeverría Bienes Raíces"
              class="h-10 w-auto max-w-[220px] object-contain object-left sm:h-12 sm:max-w-[280px]"
            />
          </a>

          <nav aria-label="Principal" class="hidden items-center gap-6 text-sm font-medium md:flex">
            @for (link of links; track link.fragment) {
              <a
                routerLink="/"
                [fragment]="link.fragment"
                class="text-foreground/75 transition hover:text-forest"
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
              class="rounded-md bg-forest px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-clay-deep"
            >
              WhatsApp
            </a>
            <button
              type="button"
              class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground md:hidden"
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
              @for (link of links; track link.fragment) {
                <a
                  routerLink="/"
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
    </div>
  `,
})
export class SiteNavComponent {
  readonly contact = CONTACT;
  readonly open = signal(false);
  readonly scrolled = signal(false);
  readonly phoneTel = `tel:${CONTACT.phoneDisplay.replace(/\s/g, '')}`;
  readonly links = [
    { fragment: 'servicios', label: 'Servicios' },
    { fragment: 'propiedades', label: 'Propiedades' },
    { fragment: 'instagram', label: 'Instagram' },
    { fragment: 'trayectoria', label: 'Trayectoria' },
    { fragment: 'contacto', label: 'Contacto' },
  ];

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 24);
  }

  toggleMenu() {
    this.open.update((v) => !v);
  }
}
