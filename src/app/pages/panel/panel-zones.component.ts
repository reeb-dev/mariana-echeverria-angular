import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../data/auth.service';
import { ToastService } from '../../data/toast.service';
import { MIN_HOME_SECTION_ITEMS, ZonesStore } from '../../data/zones-store';
import { PanelShellComponent } from './panel-shell.component';

@Component({
  selector: 'app-panel-zones',
  standalone: true,
  imports: [FormsModule, PanelShellComponent],
  template: `
    <app-panel-shell title="Zonas">
      <p class="max-w-2xl text-sm text-muted-foreground">
        Las zonas que cargues acá aparecen en la lista desplegable al crear o editar una propiedad y en el filtro del sitio
        (cuando tienen propiedades publicadas). Tildá «En la home» para que una zona tenga su propia sección en la página principal Las zonas tildadas forman un solo bloque con pestañas. Se muestra cuando la zona tiene al menos {{ min }} propiedades publicadas, y no repite las destacadas.
      </p>

      @if (auth.can('propiedades.crear')) {
        <form class="mer-card mt-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-end" (submit)="add($event)">
          <label class="min-w-0 flex-1">
            <span class="lbl">Nueva zona</span>
            <input class="inp" name="name" [(ngModel)]="name" placeholder="Ej. Pigüé, Tornquist, Pehuen Co" autocomplete="off" />
          </label>
          <button type="submit" class="h-11 rounded-lg bg-forest-deep px-5 text-sm font-semibold text-white transition hover:bg-forest">
            Agregar zona
          </button>
        </form>
      }

      @if (zones.homeSections().length > 0) {
        <section class="mer-card mt-6 p-4">
          <h2 class="font-display text-lg font-medium text-forest-deep">Orden de las pestañas en la home</h2>
          <ol class="mt-3 space-y-2">
            @for (z of zones.homeSections(); track z.id; let i = $index; let last = $last) {
              <li class="flex items-center gap-3 text-sm">
                <span class="w-5 text-center font-semibold text-forest tabular-nums">{{ i + 1 }}</span>
                <span class="min-w-0 flex-1 truncate">{{ z.name }}</span>
                @if (zones.usage(z.id) < min) {
                  <span class="text-xs text-red-700">No se muestra: tiene menos de {{ min }} propiedades.</span>
                }
                <button type="button" class="h-8 w-8 rounded-lg border border-border transition hover:border-forest disabled:opacity-30" [disabled]="i === 0" (click)="zones.moveHomeSection(z.id, -1)" aria-label="Subir">↑</button>
                <button type="button" class="h-8 w-8 rounded-lg border border-border transition hover:border-forest disabled:opacity-30" [disabled]="last" (click)="zones.moveHomeSection(z.id, 1)" aria-label="Bajar">↓</button>
              </li>
            }
          </ol>
        </section>
      }

      <div class="mt-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          class="inp max-w-sm"
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
              @if (z.homeSection && zones.usage(z.id) < min) {
                <p class="mt-1 text-xs text-red-700">Todavía no se ve en la home: necesita {{ min }} propiedades.</p>
              }
            </div>
            @if (auth.can('propiedades.destacar')) {
              <label class="flex shrink-0 cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                <input type="checkbox" class="h-4 w-4 accent-[#2d5a3d]" [checked]="z.homeSection" (change)="toggleSection(z.id, z.name)" />
                En la home
              </label>
            }
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
  styles: [
    `
      .lbl {
        display: block;
        margin-bottom: 0.375rem;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #6a5748;
      }
      .inp {
        width: 100%;
        height: 2.75rem;
        border: 1px solid #e5d9cb;
        border-radius: 0.5rem;
        background: #faf7f2;
        padding: 0 0.875rem;
        font-size: 0.875rem;
        outline: none;
      }
      .inp:focus {
        border-color: #2d5a3d;
      }
    `,
  ],
})
export class PanelZonesComponent {
  readonly auth = inject(AuthService);
  readonly zones = inject(ZonesStore);
  private readonly toast = inject(ToastService);

  readonly min = MIN_HOME_SECTION_ITEMS;
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

  toggleSection(id: string, name: string) {
    const on = this.zones.toggleHomeSection(id, name);
    this.toast.success(on ? `«${name}» tiene su sección en la home.` : `«${name}» ya no tiene sección en la home.`);
  }

  remove(id: string, name: string) {
    if (!confirm(`¿Quitar la zona «${name}»?`)) return;
    const error = this.zones.delete(id);
    if (error) this.toast.error(error);
    else this.toast.success(`Zona «${name}» quitada.`);
  }
}
