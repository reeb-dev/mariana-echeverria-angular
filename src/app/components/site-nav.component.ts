import { NgClass } from '@angular/common';
import {
  Component,
  HostListener,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
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
        [ngClass]="headerChromeClass()"
      >
        <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 md:px-8">
          <a routerLink="/" fragment="inicio" class="block shrink-0 drop-shadow-sm">
            <app-brand-logo size="md" [tone]="logoTone()" />
          </a>

          <nav aria-label="Principal" class="hidden items-center gap-7 text-sm font-medium md:flex">
            @for (link of links; track link.fragment) {
              <a
                routerLink="/"
                [fragment]="link.fragment"
                class="transition"
                [ngClass]="
                  lightChrome()
                    ? 'text-foreground/80 hover:text-forest'
                    : 'text-[#f7e6c4] hover:text-stone-warm'
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
                lightChrome()
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
                lightChrome()
                  ? 'border-border text-foreground'
                  : 'border-white/40 text-[#f7e6c4]'
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
  /** Contenido bajo el nav es espresso/hero/contacto: tipografía clara + logo on-dark. */
  readonly overDark = signal(true);
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
    const normalized = path.replace(/\/+$/, '') || '/';
    return normalized !== '/';
  });

  readonly solid = computed(() => this.scrolled() || this.open() || this.onInnerPage());

  /**
   * Chrome claro (crema + tipografía oscura) solo si el nav es sólido Y la
   * superficie debajo no es oscura. Si el glass deja ver espresso, forzar on-dark.
   */
  readonly lightChrome = computed(() => this.solid() && !this.overDark());

  readonly logoTone = computed(() => (this.lightChrome() ? 'on-light' : 'on-dark'));

  readonly headerChromeClass = computed(() => {
    if (this.lightChrome()) {
      return 'border-b border-border/60 bg-background/95 text-foreground shadow-soft backdrop-blur-xl';
    }
    if (this.solid()) {
      return 'border-b border-white/10 bg-forest-deep/90 text-primary-foreground shadow-soft backdrop-blur-xl';
    }
    return 'bg-transparent text-white';
  });

  constructor() {
    afterNextRender(() => {
      this.syncNavSurface();
      this.router.events
        .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
        .subscribe(() => {
          // Tras navegar, el DOM de secciones dark cambia; re-sondear.
          requestAnimationFrame(() => this.syncNavSurface());
        });
    });
  }

  @HostListener('window:scroll')
  onScroll() {
    this.syncNavSurface();
  }

  @HostListener('window:resize')
  onResize() {
    this.syncNavSurface();
  }

  toggleMenu() {
    this.open.update((v) => !v);
    // Menú abierto: re-evaluar (panel móvil es crema opaco; chrome sigue la superficie).
    queueMicrotask(() => this.syncNavSurface());
  }

  private syncNavSurface() {
    this.scrolled.set(window.scrollY > 24);
    this.overDark.set(this.detectOverDark());
  }

  private detectOverDark(): boolean {
    if (typeof document === 'undefined') {
      return true;
    }

    // Home al tope (hero): siempre on-dark.
    if (!this.scrolled() && !this.onInnerPage()) {
      return true;
    }

    // El host <app-site-nav> no es fixed (se va con el scroll); el chrome sí.
    const navShell = document.querySelector('app-site-nav .fixed');
    const navRoot = document.querySelector('app-site-nav');
    const navBottom = navShell?.getBoundingClientRect().bottom ?? 110;
    const probeY = Math.min(window.innerHeight - 2, Math.max(0, navBottom + 2));
    const probeX = Math.floor(window.innerWidth / 2);

    const hits = document.elementsFromPoint(probeX, probeY);
    for (const el of hits) {
      if (!(el instanceof Element)) continue;
      if (navRoot?.contains(el)) continue;
      if (el.closest('app-whatsapp-float')) continue;
      const surface = el.closest('[data-nav-surface]');
      if (surface) {
        return surface.getAttribute('data-nav-surface') === 'dark';
      }
    }

    // Fichas / páginas internas: fondos claros → chrome crema.
    if (this.onInnerPage()) {
      return false;
    }

    return false;
  }
}
