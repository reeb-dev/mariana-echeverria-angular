import { NgClass } from '@angular/common';
import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { CONTACT } from '../data/properties';
import { BrandLogoComponent } from './brand-logo.component';

@Component({
  selector: 'app-site-nav',
  standalone: true,
  imports: [RouterLink, NgClass, BrandLogoComponent],
  template: `
    <div class="fixed inset-x-0 top-0 z-40">
      <div
        class="border-b transition-colors duration-300"
        [ngClass]="
          solid()
            ? 'border-stone-warm/30 bg-forest-deep text-primary-foreground'
            : 'border-white/10 bg-forest-deep/90 text-primary-foreground backdrop-blur-md'
        "
      >
        <div
          class="mx-auto flex max-w-6xl items-center justify-between gap-x-6 px-5 py-1.5 text-xs font-medium md:px-8 md:text-sm"
        >
          <a [href]="phoneTel" class="inline-flex min-w-0 items-center gap-2 truncate transition hover:text-stone-warm">
            <span class="text-stone-warm" aria-hidden>☎</span>
            <span class="truncate">{{ contact.phoneDisplay }}</span>
            <span class="hidden text-white/50 sm:inline">/</span>
            <span class="hidden sm:inline">{{ contact.phoneSecondary }}</span>
          </a>
          <a
            [href]="'mailto:' + contact.email"
            class="hidden min-w-0 items-center gap-2 truncate transition hover:text-stone-warm sm:inline-flex"
          >
            <span class="text-stone-warm" aria-hidden>✉</span>
            <span class="truncate">{{ contact.email }}</span>
          </a>
        </div>
      </div>

      <header
        class="transition-all duration-300"
        [ngClass]="
          solid()
            ? 'border-b border-border/60 bg-background/92 text-foreground shadow-soft backdrop-blur-xl'
            : 'bg-transparent text-white'
        "
      >
        <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 md:px-8">
          <a routerLink="/" fragment="inicio" class="block shrink-0 drop-shadow-sm">
            <app-brand-logo
              size="md"
              [tone]="solid() ? 'on-light' : 'on-dark'"
            />
          </a>

          <nav aria-label="Principal" class="hidden items-center gap-7 text-sm font-medium md:flex">
            @for (link of links; track link.fragment) {
              <a
                routerLink="/"
                [fragment]="link.fragment"
                class="transition"
                [ngClass]="
                  solid()
                    ? 'text-foreground/70 hover:text-forest'
                    : 'text-white/80 hover:text-stone-warm'
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
              class="rounded-lg px-3.5 py-2 text-sm font-semibold transition"
              [ngClass]="
                solid()
                  ? 'bg-forest text-white hover:bg-clay-deep'
                  : 'bg-stone-warm text-forest-deep hover:bg-[#e8c056]'
              "
            >
              WhatsApp
            </a>
            <button
              type="button"
              class="inline-flex h-9 w-9 items-center justify-center rounded-lg border md:hidden"
              [ngClass]="
                solid()
                  ? 'border-border text-foreground'
                  : 'border-white/30 text-white'
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
              @for (link of links; track link.fragment) {
                <a
                  routerLink="/"
                  [fragment]="link.fragment"
                  class="rounded-lg px-2 py-3 text-base hover:bg-muted"
                  (click)="open.set(false)"
                >
                  {{ link.label }}
                </a>
              }
              <a
                [href]="contact.instagramUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="rounded-lg px-2 py-3 text-base text-forest hover:bg-muted"
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
  private readonly router = inject(Router);

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

  /** Rutas sin hero a pantalla completa: nav sólido (evita texto blanco sobre fondo crema). */
  private readonly url = toSignal(
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)),
    { initialValue: null }
  );

  readonly onInnerPage = computed(() => {
    const path = (this.url()?.urlAfterRedirects ?? this.router.url).split('?')[0].split('#')[0];
    return path !== '/' && path !== '';
  });

  readonly solid = computed(() => this.scrolled() || this.open() || this.onInnerPage());

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 24);
  }

  toggleMenu() {
    this.open.update((v) => !v);
  }
}
