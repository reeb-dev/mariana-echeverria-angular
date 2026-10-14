import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONTACT, coverPhoto, type Property } from '../data/properties';
import { PropertyStore } from '../data/property-store';
import { AssetUrlPipe } from '../utils/asset-url';
import { SeoService } from '../utils/seo.service';

/** Página para el «link en bio» de Instagram: lo último publicado y los accesos directos. */
@Component({
  selector: 'app-link-in-bio',
  standalone: true,
  imports: [RouterLink, AssetUrlPipe],
  template: `
    <div class="mx-auto min-h-screen max-w-md bg-background px-5 py-8">
      <header class="text-center">
        <p class="font-display text-2xl font-medium text-forest-deep">{{ contact.brand }}</p>
        <p class="text-xs tracking-[0.2em] text-forest uppercase">{{ contact.tagline }}</p>
        <p class="mt-2 text-sm text-muted-foreground">
          {{ contact.matricula }} · Coronel Suárez y Zona Norte
        </p>
      </header>

      <nav class="mt-8 space-y-3" aria-label="Accesos directos">
        <a
          [href]="contact.whatsappUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="flex h-14 items-center justify-center rounded-xl bg-forest-deep text-base font-semibold text-stone-warm transition hover:bg-forest hover:text-white"
        >
          Escribime por WhatsApp
        </a>
        <a
          routerLink="/tasacion"
          class="flex h-14 items-center justify-center rounded-xl border border-border bg-white text-base font-semibold text-forest-deep transition hover:border-forest"
        >
          Pedí tu tasación en el día
        </a>
        <a
          routerLink="/"
          fragment="propiedades"
          class="flex h-14 items-center justify-center rounded-xl border border-border bg-white text-base font-semibold text-forest-deep transition hover:border-forest"
        >
          Ver todas las propiedades
        </a>
      </nav>

      <h2 class="mt-10 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">Últimas propiedades</h2>
      <ul class="mt-4 space-y-3">
        @for (p of latest(); track p.id) {
          <li>
            <a
              [routerLink]="['/propiedades', p.slug]"
              class="flex gap-3 overflow-hidden rounded-xl border border-border bg-white transition hover:border-forest"
            >
              <img [src]="cover(p).src | assetUrl" [alt]="cover(p).alt" class="h-24 w-28 shrink-0 object-cover" />
              <span class="min-w-0 py-2 pr-3">
                <span class="block text-[10px] font-semibold tracking-[0.14em] text-forest uppercase">
                  {{ p.operation }} · {{ p.type }}
                </span>
                <span class="mt-0.5 block truncate font-medium text-forest-deep">{{ p.title }}</span>
                <span class="block truncate text-xs text-muted-foreground">{{ p.location }}</span>
                <span class="mt-1 block text-sm font-semibold text-forest-deep">{{ p.priceLabel }}</span>
              </span>
            </a>
          </li>
        }
      </ul>

      <footer class="mt-10 text-center text-xs text-muted-foreground">
        <a [href]="contact.instagramUrl" target="_blank" rel="noopener noreferrer" class="underline underline-offset-2">
          &#64;{{ contact.instagram }}
        </a>
      </footer>
    </div>
  `,
})
export class LinkInBioComponent {
  private readonly store = inject(PropertyStore);
  readonly contact = CONTACT;

  /** Las destacadas primero y después las más recientes, hasta 6. */
  readonly latest = computed(() => {
    const published = this.store.published();
    const featured = this.store.featured();
    const rest = [...published]
      .filter((p) => !p.featured)
      .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
    return [...featured, ...rest].slice(0, 6);
  });

  constructor() {
    inject(SeoService).set({
      title: 'Mariana Echeverría Bienes Raíces | Enlaces',
      description: 'Últimas propiedades, tasaciones y contacto directo.',
    });
  }

  cover(p: Property) {
    return coverPhoto(p);
  }
}
