import { ToastService } from '../data/toast.service';
import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FavoritesService } from '../data/favorites.service';
import { StatsStore } from '../data/stats-store';
import { CONTACT, coverPhoto, type Property } from '../data/properties';
import { AssetUrlPipe } from '../utils/asset-url';
import { WatermarkComponent } from './watermark.component';

/**
 * Tarjeta de propiedad: la usan el listado, las destacadas y las similares.
 *
 * Todas las tarjetas de una fila miden lo mismo: la foto tiene proporción fija, el título ocupa siempre dos líneas
 * de alto y el pie (precio y «Ver ficha») queda pegado abajo, sin importar cuánto texto tenga cada propiedad.
 */
@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [RouterLink, AssetUrlPipe, WatermarkComponent],
  host: { class: 'block h-full' },
  template: `
    <article class="prop-card group flex h-full flex-col">
      <a [routerLink]="['/propiedades', property().slug]" class="flex flex-1 flex-col">
        <div class="prop-card-media">
          <img [src]="cover().src | assetUrl" [alt]="cover().alt" loading="lazy" decoding="async" />
          @if (!cover().watermarked) {
            <app-watermark position="top-left" />
          }
          <div class="absolute inset-0 z-[1] bg-gradient-to-t from-forest-deep/40 via-transparent to-transparent"></div>
          @if (showFavorite()) {
            <button
              type="button"
              class="absolute top-3 right-3 z-[3] flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg shadow-soft transition hover:scale-105"
              [class.text-forest]="isFavorite()"
              [class.text-muted-foreground]="!isFavorite()"
              [attr.aria-pressed]="isFavorite()"
              [attr.aria-label]="isFavorite() ? 'Quitar de favoritas' : 'Guardar en favoritas'"
              (click)="toggleFavorite($event)"
            >
              {{ isFavorite() ? '♥' : '♡' }}
            </button>
          }
          @if (showFeaturedBadge() && property().featured) {
            <span
              class="absolute top-4 left-4 z-[2] rounded-full bg-stone-warm px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-forest-deep uppercase"
            >
              Destacada
            </span>
          }
          <div class="absolute inset-x-0 bottom-0 z-[2] flex items-end justify-between gap-2 p-4">
            <span class="prop-card-badge">{{ property().operation }}</span>
            <span class="text-[11px] font-medium text-white/85">{{ property().photos.length }} fotos</span>
          </div>
        </div>

        <div class="flex flex-1 flex-col px-5 pt-5 pb-4">
          <p class="eyebrow truncate text-[10px] text-forest">
            {{ property().type }}@if (property().highlight) { · {{ property().highlight }} }
          </p>
          <!-- Dos líneas de alto siempre, así los títulos cortos y largos no corren el resto de la tarjeta -->
          <h3
            class="mt-2 line-clamp-2 min-h-[3.4rem] font-display text-xl font-medium leading-snug text-forest-deep transition group-hover:text-forest"
          >
            {{ property().title }}
          </h3>
          <p class="mt-2 truncate text-sm text-muted-foreground">{{ property().location }}</p>
          <p class="mt-1 truncate text-sm text-muted-foreground">{{ details() }}</p>
        </div>
      </a>

      <div class="mt-auto flex items-center justify-between gap-3 border-t border-border/70 px-5 py-4">
        <div class="min-w-0">
          <p class="truncate text-lg font-semibold leading-tight tracking-tight text-forest-deep">{{ property().priceLabel }}</p>
          <p class="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted-foreground/80">
            <a
              [href]="whatsappUrl()"
              (click)="recordWhatsapp()"
              target="_blank"
              rel="noopener noreferrer"
              class="transition hover:text-forest"
            >
              WhatsApp
            </a>
            <a
              [routerLink]="['/propiedades', property().slug]"
              [queryParams]="{ visita: 1 }"
              class="font-medium text-forest transition hover:underline"
            >
              Pedir visita
            </a>
          </p>
        </div>
        <a
          [routerLink]="['/propiedades', property().slug]"
          class="inline-flex h-10 shrink-0 items-center rounded-lg bg-forest-deep px-4 text-sm font-semibold text-stone-warm transition hover:bg-forest hover:text-white"
        >
          Ver ficha
        </a>
      </div>
    </article>
  `,
})
export class PropertyCardComponent {
  protected readonly toast = inject(ToastService);
  readonly property = input.required<Property>();
  /** En la sección de destacadas se muestra la etiqueta sobre la foto. */
  readonly showFeaturedBadge = input(false);
  /** El corazón de favoritas (se oculta en la vista previa del panel). */
  readonly showFavorite = input(true);
  private readonly favorites = inject(FavoritesService);
  private readonly stats = inject(StatsStore);

  recordWhatsapp() {
    this.stats.record(this.property().slug, 'whatsapp');
  }

  isFavorite() {
    return this.favorites.has(this.property().slug);
  }

  toggleFavorite(event: Event) {
    // La tarjeta es un enlace: el corazón no debe abrir la ficha.
    event.preventDefault();
    event.stopPropagation();
    this.favorites.toggle(this.property().slug);
    this.toast.success(this.isFavorite() ? 'Guardada en tus favoritas.' : 'Quitada de tus favoritas.');
  }

  cover() {
    return coverPhoto(this.property());
  }

  /** Superficie y ambientes en una sola línea; si la superficie no es un número se aclara que es a consultar. */
  details(): string {
    const p = this.property();
    const parts: string[] = [];
    parts.push(/\d/.test(p.areaLabel) ? p.areaLabel : 'Superficie a consultar');
    if (p.beds != null) parts.push(`${p.beds} dorm.`);
    if (p.baths != null) parts.push(`${p.baths} ${p.baths === 1 ? 'baño' : 'baños'}`);
    return parts.join(' · ');
  }

  whatsappUrl() {
    const p = this.property();
    return `${CONTACT.whatsappUrl}?text=${encodeURIComponent(
      `Hola Mariana, me interesa: ${p.title} (${p.location}).`
    )}`;
  }
}
