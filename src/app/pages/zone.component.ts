import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PropertyCardComponent } from '../components/property-card.component';
import { PropertyStore } from '../data/property-store';
import { CONTACT } from '../data/properties';
import { ZONE_PAGES } from '../data/zone-pages';
import { SeoService } from '../utils/seo.service';

/** Página de una zona: qué hacemos ahí y sus propiedades publicadas. */
@Component({
  selector: 'app-zone',
  standalone: true,
  imports: [RouterLink, PropertyCardComponent],
  template: `
    <div class="mx-auto max-w-6xl px-5 pt-[8.5rem] pb-24 md:px-8 md:pt-[9.5rem]">
      @if (zone(); as z) {
        <nav aria-label="Ubicación en el sitio" class="text-sm text-muted-foreground">
          <a routerLink="/" class="transition hover:text-forest">Inicio</a> <span aria-hidden="true">›</span>
          <span class="text-forest-deep">{{ z.name }}</span>
        </nav>

        <p class="eyebrow mt-8 text-forest">Zona</p>
        <h1 class="section-title mt-3 text-4xl text-forest-deep md:text-5xl">{{ z.name }}</h1>
        <p class="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">{{ z.intro }}</p>

        <ul class="mt-8 grid gap-3 sm:grid-cols-2">
          @for (item of z.services; track item) {
            <li class="mer-card flex items-center gap-3 px-4 py-3 text-sm">
              <svg viewBox="0 0 24 24" class="h-5 w-5 shrink-0 text-forest" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
              {{ item }}
            </li>
          }
        </ul>

        <h2 class="mt-14 font-display text-2xl font-medium text-forest-deep">Propiedades en {{ z.name }}</h2>
        @if (properties().length > 0) {
          <ul class="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            @for (p of properties(); track p.id) {
              <li class="h-full"><app-property-card [property]="p" /></li>
            }
          </ul>
        } @else {
          <div class="mer-card mt-6 p-8 text-center">
            <p class="font-medium text-forest-deep">Ahora no hay avisos publicados en esta zona.</p>
            <p class="mt-1 text-sm text-muted-foreground">
              Escribinos y te avisamos cuando entre algo, o mirá todas las propiedades.
            </p>
            <div class="mt-5 flex flex-wrap justify-center gap-3">
              <a [href]="contact.whatsappUrl" target="_blank" rel="noopener noreferrer"
                 class="inline-flex h-11 items-center rounded-lg bg-stone-warm px-5 text-sm font-semibold text-forest-deep transition hover:bg-[#e8c056]">
                Escribir por WhatsApp
              </a>
              <a routerLink="/" fragment="propiedades"
                 class="inline-flex h-11 items-center rounded-lg border border-border px-5 text-sm font-medium transition hover:border-forest">
                Ver todas las propiedades
              </a>
            </div>
          </div>
        }

        <section class="mer-card mer-card-accent mt-14 flex flex-wrap items-center justify-between gap-5 p-6">
          <div class="max-w-xl">
            <p class="font-display text-xl font-medium text-forest-deep">¿Tenés una propiedad en {{ z.name }}?</p>
            <p class="mt-1 text-sm text-muted-foreground">Pedí tu tasación en el día, sin compromiso.</p>
          </div>
          <a routerLink="/tasacion"
             class="inline-flex h-11 items-center rounded-lg bg-forest-deep px-6 text-sm font-semibold text-stone-warm transition hover:bg-forest hover:text-white">
            Pedir mi tasación
          </a>
        </section>

        <h2 class="mt-14 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">Otras zonas</h2>
        <ul class="mt-3 flex flex-wrap gap-2">
          @for (other of others(); track other.slug) {
            <li>
              <a [routerLink]="['/zona', other.slug]" class="filter-chip filter-chip-idle">{{ other.name }}</a>
            </li>
          }
        </ul>
      } @else {
        <h1 class="section-title text-3xl text-forest-deep">Zona no encontrada</h1>
        <a routerLink="/" class="mt-4 inline-block text-forest underline">Volver al inicio</a>
      }
    </div>
  `,
})
export class ZoneComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(PropertyStore);
  readonly contact = CONTACT;

  readonly zone = computed(() => ZONE_PAGES.find((z) => z.slug === this.route.snapshot.paramMap.get('slug')) ?? null);
  readonly others = computed(() => ZONE_PAGES.filter((z) => z.slug !== this.zone()?.slug));
  readonly properties = computed(() => {
    const z = this.zone();
    return z ? this.store.published().filter((p) => p.zone === z.zoneId) : [];
  });

  constructor() {
    const z = this.zone();
    inject(SeoService).set(
      z
        ? { title: `${z.seoTitle} | Mariana Echeverría Bienes Raíces`, description: z.description }
        : { title: 'Zona no encontrada | Mariana Echeverría Bienes Raíces', description: 'La zona no está disponible.' }
    );
  }
}
