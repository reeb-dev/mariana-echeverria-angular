import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CompareService } from '../data/compare.service';
import { PropertyStore } from '../data/property-store';
import { CONTACT, coverPhoto, labelForZone, type Property } from '../data/properties';
import { AssetUrlPipe } from '../utils/asset-url';
import { SeoService } from '../utils/seo.service';

type Row = { label: string; value: (p: Property) => string };

/** Hasta 3 propiedades lado a lado. */
@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [RouterLink, AssetUrlPipe],
  template: `
    <div class="mx-auto max-w-6xl px-5 pt-[8.5rem] pb-24 md:px-8 md:pt-[9.5rem]">
      <a routerLink="/" class="text-sm text-muted-foreground transition hover:text-forest">← Volver al sitio</a>
      <p class="eyebrow mt-8 text-forest">Comparar</p>
      <h1 class="section-title mt-3 text-3xl text-forest-deep md:text-4xl">Propiedades lado a lado</h1>

      @if (items().length === 0) {
        <div class="mer-card mt-8 p-8 text-center">
          <p class="font-medium text-forest-deep">Todavía no elegiste propiedades para comparar.</p>
          <p class="mt-1 text-sm text-muted-foreground">En cada tarjeta tenés el botón «Comparar»; podés elegir hasta 3.</p>
          <a routerLink="/" fragment="propiedades" class="mt-5 inline-flex h-11 items-center rounded-lg bg-forest-deep px-5 text-sm font-semibold text-stone-warm">
            Ver propiedades
          </a>
        </div>
      } @else {
        <div class="mt-8 overflow-x-auto">
          <table class="w-full min-w-[34rem] border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th class="w-32 p-0"></th>
                @for (p of items(); track p.id) {
                  <th class="p-2 align-top font-normal">
                    <a [routerLink]="['/propiedades', p.slug]" class="mer-card mer-card-link block overflow-hidden text-left">
                      <img [src]="cover(p).src | assetUrl" [alt]="cover(p).alt" class="h-36 w-full object-cover" />
                      <span class="block p-3 font-display text-base font-medium leading-snug text-forest-deep">{{ p.title }}</span>
                    </a>
                  </th>
                }
              </tr>
            </thead>
            <tbody>
              @for (row of rows; track row.label) {
                <tr class="even:bg-mist/60">
                  <th scope="row" class="px-3 py-3 text-left text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">{{ row.label }}</th>
                  @for (p of items(); track p.id) {
                    <td class="px-3 py-3 text-forest-deep">{{ row.value(p) }}</td>
                  }
                </tr>
              }
              <tr>
                <th></th>
                @for (p of items(); track p.id) {
                  <td class="px-3 py-4">
                    <div class="flex flex-wrap gap-2">
                      <a
                        [href]="whatsapp(p)"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="inline-flex h-10 items-center rounded-lg bg-stone-warm px-4 text-sm font-semibold text-forest-deep transition hover:bg-[#e8c056]"
                      >
                        Consultar
                      </a>
                      <button
                        type="button"
                        class="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm transition hover:border-forest"
                        (click)="compare.toggle(p.slug)"
                      >
                        Quitar
                      </button>
                    </div>
                  </td>
                }
              </tr>
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class CompareComponent {
  readonly compare = inject(CompareService);
  private readonly store = inject(PropertyStore);

  readonly items = computed(() =>
    this.compare
      .all()
      .map((slug) => this.store.published().find((p) => p.slug === slug))
      .filter((p): p is Property => !!p)
  );

  readonly rows: Row[] = [
    { label: 'Operación', value: (p) => (p.operation === 'alquiler' ? 'Alquiler' : 'Venta') },
    { label: 'Precio', value: (p) => p.priceLabel },
    { label: 'Tipo', value: (p) => p.type },
    { label: 'Zona', value: (p) => labelForZone(p.zone) },
    { label: 'Ubicación', value: (p) => p.location },
    { label: 'Superficie', value: (p) => p.areaLabel || '—' },
    { label: 'Dormitorios', value: (p) => (p.beds != null ? String(p.beds) : '—') },
    { label: 'Baños', value: (p) => (p.baths != null ? String(p.baths) : '—') },
    { label: 'Cocheras', value: (p) => (p.garages != null ? String(p.garages) : '—') },
    { label: 'Antigüedad', value: (p) => (p.ageYears == null ? '—' : p.ageYears === 0 ? 'A estrenar' : `${p.ageYears} años`) },
    { label: 'Servicios y extras', value: (p) => (p.amenities.length ? p.amenities.slice(0, 5).join(', ') : '—') },
  ];

  constructor() {
    inject(SeoService).set({
      title: 'Comparar propiedades | Mariana Echeverría Bienes Raíces',
      description: 'Compará hasta tres propiedades lado a lado.',
    });
  }

  cover(p: Property) {
    return coverPhoto(p);
  }

  whatsapp(p: Property) {
    return `${CONTACT.whatsappUrl}?text=${encodeURIComponent(`Hola Mariana, estoy comparando propiedades y me interesa: ${p.title} (${p.location}).`)}`;
  }
}
