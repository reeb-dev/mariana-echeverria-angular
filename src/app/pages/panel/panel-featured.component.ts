import { ToastService } from '../../data/toast.service';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../data/auth.service';
import { MAX_FEATURED, PropertyStore } from '../../data/property-store';
import { STATUS_LABELS, coverPhoto, type Property } from '../../data/properties';
import { AssetUrlPipe } from '../../utils/asset-url';
import { PanelShellComponent } from './panel-shell.component';

@Component({
  selector: 'app-panel-featured',
  standalone: true,
  imports: [RouterLink, AssetUrlPipe, PanelShellComponent],
  template: `
    <app-panel-shell title="Destacadas">
      <p class="max-w-2xl text-sm text-muted-foreground">
        Las destacadas aparecen en una sección propia de la home, en este orden. Hasta {{ max }} propiedades; solo se
        muestran las que están publicadas.
      </p>

      @if (notice(); as text) {
        <p class="mt-4 rounded-lg border border-border bg-background px-4 py-3 text-sm text-forest-deep" role="status">{{ text }}</p>
      }

      <h2 class="mt-8 font-display text-xl font-medium text-forest-deep">
        En la home ({{ store.featuredAll().length }} de {{ max }})
      </h2>
      <ol class="mt-4 space-y-3">
        @for (property of store.featuredAll(); track property.id; let i = $index; let last = $last) {
          <li class="flex items-center gap-4 mer-card p-3">
            <span class="w-6 text-center text-sm font-semibold text-forest tabular-nums">{{ i + 1 }}</span>
            <img [src]="cover(property).src | assetUrl" [alt]="cover(property).alt" class="h-16 w-24 shrink-0 rounded-lg object-cover" />
            <div class="min-w-0 flex-1">
              <p class="truncate font-medium text-forest-deep">{{ property.title }}</p>
              <p class="truncate text-sm text-muted-foreground">{{ property.location }} · {{ property.priceLabel }}</p>
              @if (store.statusOf(property) !== 'publicada') {
                <p class="text-xs text-red-700">
                  {{ statusLabels[store.statusOf(property)] }}: no se muestra en la home mientras no esté publicada.
                </p>
              }
            </div>
            @if (auth.can('propiedades.destacar')) {
              <div class="flex shrink-0 gap-1.5">
                <button
                  type="button"
                  class="h-9 w-9 rounded-lg border border-border text-sm transition hover:border-forest disabled:opacity-30"
                  [disabled]="i === 0"
                  (click)="store.moveFeatured(property.id, -1)"
                  aria-label="Subir"
                >
                  ↑
                </button>
                <button
                  type="button"
                  class="h-9 w-9 rounded-lg border border-border text-sm transition hover:border-forest disabled:opacity-30"
                  [disabled]="last"
                  (click)="store.moveFeatured(property.id, 1)"
                  aria-label="Bajar"
                >
                  ↓
                </button>
                <button
                  type="button"
                  class="h-9 rounded-lg border border-border px-3 text-sm text-red-700 transition hover:border-red-400"
                  (click)="remove(property)"
                >
                  Quitar
                </button>
              </div>
            }
          </li>
        } @empty {
          <li class="rounded-xl border border-dashed border-border bg-background p-8 text-center text-muted-foreground">
            Todavía no hay propiedades destacadas.
          </li>
        }
      </ol>

      @if (auth.can('propiedades.destacar')) {
        <h2 class="mt-10 font-display text-xl font-medium text-forest-deep">Agregar a destacadas</h2>
        <ul class="mt-4 grid gap-3 md:grid-cols-2">
          @for (property of candidates(); track property.id) {
            <li class="flex items-center gap-3 mer-card p-3">
              <img [src]="cover(property).src | assetUrl" [alt]="cover(property).alt" class="h-14 w-20 shrink-0 rounded-lg object-cover" />
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-forest-deep">{{ property.title }}</p>
                <p class="truncate text-xs text-muted-foreground">{{ property.location }}</p>
              </div>
              <button
                type="button"
                class="h-9 shrink-0 rounded-lg border border-border px-3 text-sm font-medium transition hover:border-forest"
                (click)="add(property)"
              >
                ☆ Destacar
              </button>
            </li>
          } @empty {
            <li class="text-sm text-muted-foreground">No quedan propiedades publicadas para destacar.</li>
          }
        </ul>
      } @else {
        <p class="mt-8 text-sm text-muted-foreground">
          Solo la titular puede cambiar las destacadas.
          <a routerLink="/panel/propiedades" class="text-forest underline">Ver propiedades</a>
        </p>
      }
    </app-panel-shell>
  `,
})
export class PanelFeaturedComponent {
  protected readonly toast = inject(ToastService);
  readonly store = inject(PropertyStore);
  readonly auth = inject(AuthService);
  readonly max = MAX_FEATURED;
  readonly statusLabels = STATUS_LABELS;
  readonly notice = signal<string | null>(null);

  /** Publicadas que todavía no son destacadas. */
  readonly candidates = computed(() => this.store.published().filter((p) => !p.featured));

  cover(property: Property) {
    return coverPhoto(property);
  }

  add(property: Property) {
    const ok = this.store.toggleFeatured(property.id);
    this.notice.set(ok ? null : `Ya hay ${MAX_FEATURED} destacadas. Quitá una antes de sumar otra.`);
    if (ok) this.toast.success(`«${property.title}» ahora es destacada.`);
    else this.toast.error(`Ya hay ${MAX_FEATURED} destacadas. Quitá una antes de sumar otra.`);
  }

  remove(property: Property) {
    this.store.toggleFeatured(property.id);
    this.notice.set(null);
    this.toast.success(`«${property.title}» ya no es destacada.`);
  }
}
