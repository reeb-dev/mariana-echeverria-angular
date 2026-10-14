import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../data/auth.service';
import { ToastService } from '../../data/toast.service';
import { ZonesStore } from '../../data/zones-store';
import { PanelShellComponent } from './panel-shell.component';

@Component({
  selector: 'app-panel-zones',
  standalone: true,
  imports: [FormsModule, PanelShellComponent],
  template: `
    <app-panel-shell title="Zonas">
      <p class="max-w-2xl text-sm text-muted-foreground">
        Las zonas que cargues acá aparecen en la lista desplegable al crear o editar una propiedad y en el filtro del sitio
        (cuando tienen propiedades publicadas).
      </p>

      @if (auth.can('propiedades.crear')) {
        <form class="mer-card mt-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-end" (submit)="add($event)">
          <label class="min-w-0 flex-1">
            <span class="field-label">Nueva zona</span>
            <input class="field" name="name" [(ngModel)]="name" placeholder="Ej. Pigüé, Tornquist, Pehuen Co" autocomplete="off" />
          </label>
          <button type="submit" class="h-11 rounded-lg bg-forest-deep px-5 text-sm font-semibold text-white transition hover:bg-forest">
            Agregar zona
          </button>
        </form>
      }

      <div class="mt-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          class="field max-w-sm"
          name="q"
          [ngModel]="query()"
          (ngModelChange)="query.set($event)"
          placeholder="Buscar zona…"
          aria-label="Buscar zona"
        />
        <span class="text-sm text-muted-foreground">{{ filtered().length }} de {{ zones.options().length }} zonas</span>
      </div>

      <ul class="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        @for (z of filtered(); track z.id) {
          <li class="mer-card flex items-center gap-3 p-4">
            <div class="min-w-0 flex-1">
              <p class="truncate font-medium text-forest-deep">{{ z.name }}</p>
              <p class="text-sm text-muted-foreground">
                {{ zones.usage(z.id) }} {{ zones.usage(z.id) === 1 ? 'propiedad' : 'propiedades' }}
              </p>
            </div>
            @if (auth.can('propiedades.eliminar') && zones.usage(z.id) === 0) {
              <button
                type="button"
                class="shrink-0 rounded-lg border border-border px-3 py-1.5 text-sm text-red-700 transition hover:border-red-300"
                (click)="remove(z.id, z.name)"
              >
                Quitar
              </button>
            }
          </li>
        } @empty {
          <li class="text-sm text-muted-foreground sm:col-span-2 xl:col-span-3">No hay zonas que coincidan con la búsqueda.</li>
        }
      </ul>
    </app-panel-shell>
  `,
})
export class PanelZonesComponent {
  readonly auth = inject(AuthService);
  readonly zones = inject(ZonesStore);
  private readonly toast = inject(ToastService);

  name = '';
  readonly query = signal('');

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.zones.options().filter((z) => !q || z.name.toLowerCase().includes(q));
  });

  add(event: Event) {
    event.preventDefault();
    const error = this.zones.add(this.name);
    if (error) {
      this.toast.error(error);
      return;
    }
    this.toast.success(`Zona «${this.name.trim()}» agregada.`);
    this.name = '';
  }

  remove(id: string, name: string) {
    if (!confirm(`¿Quitar la zona «${name}»?`)) return;
    const error = this.zones.delete(id);
    if (error) this.toast.error(error);
    else this.toast.success(`Zona «${name}» quitada.`);
  }
}
