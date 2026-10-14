import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../data/auth.service';
import { ToastService } from '../../data/toast.service';
import { MAX_FEATURED, PropertyStore } from '../../data/property-store';
import { listingQuality } from '../../data/listing-quality';
import { BRANCH_LABELS, branchOf, type PropertyBranch } from '../../data/properties';
import { UsersStore } from '../../data/users-store';
import {
  STATUS_LABELS,
  coverPhoto,
  type Property,
  type PropertyStatus,
} from '../../data/properties';
import { AssetUrlPipe } from '../../utils/asset-url';
import { PanelShellComponent } from './panel-shell.component';

@Component({
  selector: 'app-panel-list',
  standalone: true,
  imports: [FormsModule, RouterLink, AssetUrlPipe, PanelShellComponent],
  template: `
    <app-panel-shell title="Propiedades">
      @if (store.storageError(); as error) {
        <p class="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{{ error }}</p>
      }
      @if (notice(); as text) {
        <p class="mb-6 rounded-lg border border-border bg-background px-4 py-3 text-sm text-forest-deep">{{ text }}</p>
      }

      <!-- Acciones y filtros -->
      <div class="mt-8 flex flex-col gap-3 md:flex-row md:items-center">
        <input
          type="search"
          placeholder="Buscar por título, zona o tipo…"
          class="h-11 w-full rounded-lg border border-border bg-background px-3.5 text-sm outline-none focus:border-forest focus:ring-2 focus:ring-forest/20 md:max-w-sm"
          [ngModel]="query()"
          (ngModelChange)="query.set($event)"
          aria-label="Buscar propiedades"
        />
        <select
          class="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-forest"
          [ngModel]="branchFilter()"
          (ngModelChange)="branchFilter.set($event)"
          aria-label="Filtrar por sucursal"
        >
          <option value="todas">Todas las sucursales</option>
          @for (b of branches; track b.id) {
            <option [value]="b.id">{{ b.label }}</option>
          }
        </select>
        <select
          class="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-forest"
          [ngModel]="sortBy()"
          (ngModelChange)="sortBy.set($event)"
          aria-label="Ordenar por"
        >
          <option value="recientes">Más recientes</option>
          <option value="titulo">Título A–Z</option>
          <option value="estado">Por estado</option>
        </select>
        <select
          class="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-forest"
          [ngModel]="statusFilter()"
          (ngModelChange)="statusFilter.set($event)"
          aria-label="Filtrar por estado"
        >
          <option value="todas">Todos los estados</option>
          @for (s of statuses; track s.id) {
            <option [value]="s.id">{{ s.label }}</option>
          }
        </select>
        @if (auth.user()?.role === 'agente') {
          <label class="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" [ngModel]="onlyMine()" (ngModelChange)="onlyMine.set($event)" />
            Solo las mías
          </label>
        }
        @if (auth.can('propiedades.crear')) {
          <a
            routerLink="/panel/propiedad/nueva"
            class="inline-flex h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-forest-deep px-5 text-sm font-semibold text-stone-warm transition hover:bg-forest hover:text-white md:ml-auto"
          >
            + Nueva propiedad
          </a>
        }
      </div>

      <!-- Acciones en lote -->
      @if (selected().size > 0) {
        <div
          class="sticky top-2 z-30 mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-forest/40 bg-forest-deep px-4 py-3 text-white shadow-card"
          role="region"
          aria-label="Acciones sobre la selección"
        >
          <p class="text-sm font-semibold">{{ selected().size }} {{ selected().size === 1 ? 'seleccionada' : 'seleccionadas' }}</p>
          <select
            class="h-10 rounded-lg border border-white/25 bg-white/10 px-2 text-sm text-white"
            (change)="bulkStatus($any($event.target).value); $any($event.target).value = ''"
            aria-label="Cambiar el estado de las seleccionadas"
          >
            <option value="" class="text-foreground">Cambiar estado…</option>
            @for (s of statuses; track s.id) {
              <option [value]="s.id" class="text-foreground">{{ s.label }}</option>
            }
          </select>
          @if (auth.can('propiedades.editar.todas')) {
            <select
              class="h-10 rounded-lg border border-white/25 bg-white/10 px-2 text-sm text-white"
              (change)="bulkAgent($any($event.target).value); $any($event.target).value = '__none'"
              aria-label="Asignar responsable a las seleccionadas"
            >
              <option value="__none" class="text-foreground">Asignar responsable…</option>
              <option value="" class="text-foreground">Sin responsable</option>
              @for (u of agents(); track u.id) {
                <option [value]="u.id" class="text-foreground">{{ u.name }}</option>
              }
            </select>
            <select
              class="h-10 rounded-lg border border-white/25 bg-white/10 px-2 text-sm text-white"
              (change)="bulkBranch($any($event.target).value); $any($event.target).value = '__none'"
              aria-label="Cambiar la sucursal de las seleccionadas"
            >
              <option value="__none" class="text-foreground">Sucursal…</option>
              @for (b of branches; track b.id) {
                <option [value]="b.id" class="text-foreground">{{ b.label }}</option>
              }
            </select>
          }
          @if (auth.can('propiedades.eliminar')) {
            <button
              type="button"
              class="h-10 rounded-lg border border-red-300/60 px-3 text-sm font-medium text-red-200 transition hover:bg-red-500/20"
              (click)="bulkRemove()"
            >
              Eliminar
            </button>
          }
          <button
            type="button"
            class="ml-auto h-10 rounded-lg px-3 text-sm text-white/80 transition hover:text-white"
            (click)="clearSelection()"
          >
            Quitar selección
          </button>
        </div>
      }

      <!-- Listado -->
      @if (filtered().length > 0) {
        <label class="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            class="h-4 w-4"
            [checked]="allSelected()"
            (change)="toggleAll($any($event.target).checked)"
            aria-label="Seleccionar todas las propiedades del listado"
          />
          Seleccionar todas ({{ filtered().length }})
        </label>
      }
      <ul class="mt-3 space-y-3">
        @for (property of filtered(); track property.id) {
          <li
            class="mer-card flex flex-col gap-4 p-4 transition md:flex-row md:items-center"
            [class.ring-2]="selected().has(property.id)"
            [class.ring-forest]="selected().has(property.id)"
          >
            <input
              type="checkbox"
              class="h-4 w-4 shrink-0 self-start md:self-center"
              [checked]="selected().has(property.id)"
              (change)="toggle(property.id)"
              [attr.aria-label]="'Seleccionar ' + property.title"
            />
            <img
              [src]="cover(property).src | assetUrl"
              [alt]="cover(property).alt"
              class="h-24 w-full shrink-0 rounded-lg object-cover md:h-20 md:w-32"
            />
            <div class="min-w-0 flex-1 md:min-w-[14rem]">
              <p class="line-clamp-2 font-medium text-forest-deep">{{ property.title }}</p>
              <p class="truncate text-sm text-muted-foreground">
                {{ property.location }} · {{ property.type }} · {{ property.operation }}
              </p>
              <p class="text-sm font-semibold text-forest-deep">{{ property.priceLabel }}</p>
              <p class="text-xs text-muted-foreground">
                Responsable: {{ agentName(property) }} ·
                <span
                  class="rounded-full px-2 py-0.5 font-semibold"
                  [class]="
                    quality(property).level === 'muy-bueno'
                      ? 'bg-green-100 text-green-800'
                      : quality(property).level === 'bueno'
                        ? 'bg-stone-warm/40 text-forest-deep'
                        : 'bg-red-100 text-red-800'
                  "
                  [attr.title]="'Calidad del aviso: ' + quality(property).levelLabel"
                >
                  Calidad {{ quality(property).score }}
                </span>
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2 md:shrink-0 md:justify-end">
              <select
                class="h-10 rounded-lg border border-border bg-background px-2 text-sm outline-none focus:border-forest disabled:opacity-60"
                [ngModel]="store.statusOf(property)"
                (ngModelChange)="changeStatus(property, $event)"
                [disabled]="!auth.canEdit(property)"
                [attr.aria-label]="'Estado de ' + property.title"
              >
                @for (s of statuses; track s.id) {
                  <option [value]="s.id">{{ s.label }}</option>
                }
              </select>
              @if (auth.can('propiedades.destacar')) {
                <button
                  type="button"
                  class="h-10 rounded-lg border px-3 text-sm font-medium transition"
                  [class]="
                    property.featured
                      ? 'border-stone-warm bg-stone-warm text-forest-deep'
                      : 'border-border hover:border-forest'
                  "
                  [attr.aria-pressed]="!!property.featured"
                  [attr.aria-label]="property.featured ? 'Quitar de destacadas' : 'Destacar'"
                  (click)="toggleFeatured(property)"
                >
                  {{ property.featured ? '★' : '☆' }}
                </button>
              } @else if (property.featured) {
                <span class="inline-flex h-10 items-center rounded-lg bg-stone-warm/40 px-3 text-sm font-medium text-forest-deep">
                  ★
                </span>
              }
              <a
                [routerLink]="['/panel/propiedad', property.id]"
                class="inline-flex h-10 items-center rounded-lg bg-forest-deep px-4 text-sm font-semibold text-stone-warm transition hover:bg-forest hover:text-white"
              >
                {{ auth.canEdit(property) ? 'Editar' : 'Ver' }}
              </a>

              <!-- Más acciones -->
              <details class="relative">
                <summary
                  class="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg border border-border text-lg leading-none transition hover:border-forest [&::-webkit-details-marker]:hidden"
                  aria-label="Más acciones"
                  title="Más acciones"
                >
                  ⋯
                </summary>
                <div
                  class="absolute right-0 z-20 mt-1 w-52 rounded-xl border border-border bg-white p-1.5 shadow-card"
                  (click)="closeMenu($event)"
                >
                  @if (store.statusOf(property) === 'publicada') {
                    <a
                      [routerLink]="['/propiedades', property.slug]"
                      target="_blank"
                      class="block rounded-lg px-3 py-2 text-sm transition hover:bg-mist"
                    >
                      Ver en el sitio
                    </a>
                  }
                  <a
                    [routerLink]="['/panel/propiedad', property.id, 'cartel']"
                    class="block rounded-lg px-3 py-2 text-sm transition hover:bg-mist"
                  >
                    Cartel con QR
                  </a>
                  <a
                    [routerLink]="['/panel/propiedad', property.id, 'informe']"
                    class="block rounded-lg px-3 py-2 text-sm transition hover:bg-mist"
                  >
                    Informe al propietario
                  </a>
                  @if (auth.can('propiedades.crear')) {
                    <button
                      type="button"
                      class="block w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-mist"
                      (click)="duplicate(property)"
                    >
                      Duplicar
                    </button>
                  }
                  @if (auth.can('propiedades.eliminar')) {
                    <button
                      type="button"
                      class="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-700 transition hover:bg-red-50"
                      (click)="remove(property)"
                    >
                      Eliminar
                    </button>
                  }
                </div>
              </details>
            </div>
          </li>
        } @empty {
          <li class="rounded-xl border border-dashed border-border bg-background p-8 text-center text-muted-foreground">
            No hay propiedades que coincidan con la búsqueda.
          </li>
        }
      </ul>

    </app-panel-shell>
  `,
})
export class PanelListComponent {
  readonly store = inject(PropertyStore);
  readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly users = inject(UsersStore);
    readonly statuses = (Object.keys(STATUS_LABELS) as PropertyStatus[]).map((id) => ({
    id,
    label: STATUS_LABELS[id],
  }));

  readonly query = signal('');
  readonly statusFilter = signal<'todas' | PropertyStatus>('todas');
  readonly onlyMine = signal(false);

  /** Propiedades marcadas para una acción en lote. */
  readonly selected = signal<ReadonlySet<string>>(new Set());
  readonly agents = computed(() =>
    this.users.all().filter((u) => u.active && (u.role === 'titular' || u.role === 'agente'))
  );
  readonly branchFilter = signal<'todas' | PropertyBranch>('todas');
  readonly branches = (Object.keys(BRANCH_LABELS) as PropertyBranch[]).map((id) => ({ id, label: BRANCH_LABELS[id] }));
  readonly sortBy = signal<'recientes' | 'titulo' | 'estado'>('recientes');
  readonly notice = signal<string | null>(null);

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const status = this.statusFilter();
    const mine = this.onlyMine() ? this.auth.user()?.id : null;
    const sort = this.sortBy();
    const order: PropertyStatus[] = ['publicada', 'pausada', 'alquilada', 'vendida'];
    const list = this.store.all().filter((p) => {
      if (mine && p.agentId !== mine) return false;
      if (this.branchFilter() !== 'todas' && branchOf(p) !== this.branchFilter()) return false;
      const matchStatus = status === 'todas' || this.store.statusOf(p) === status;
      const haystack = `${p.title} ${p.location} ${p.type} ${p.operation}`.toLowerCase();
      return matchStatus && (!q || haystack.includes(q));
    });
    return [...list].sort((a, b) => {
      if (sort === 'titulo') return a.title.localeCompare(b.title, 'es');
      if (sort === 'estado') {
        return order.indexOf(this.store.statusOf(a)) - order.indexOf(this.store.statusOf(b));
      }
      return (b.updatedAt ?? '').localeCompare(a.updatedAt ?? '');
    });
  });

  quality(property: Property) {
    return listingQuality(property);
  }

  agentName(property: Property): string {
    const agent = property.agentId ? this.users.getById(property.agentId) : undefined;
    return agent?.name ?? 'Sin asignar';
  }

  cover(property: Property) {
    return coverPhoto(property);
  }

  statusLabel(property: Property) {
    return STATUS_LABELS[this.store.statusOf(property)];
  }

  changeStatus(property: Property, status: PropertyStatus) {
    this.store.setStatus(property.id, status);
    this.notice.set(null);
  }

  toggleFeatured(property: Property) {
    const ok = this.store.toggleFeatured(property.id);
    if (!ok && !property.featured) {
      this.notice.set(
        `Ya hay ${MAX_FEATURED} propiedades destacadas. Sacá una antes de destacar otra.`
      );
    } else {
      this.notice.set(null);
    }
  }

  readonly allSelected = computed(() => {
    const list = this.filtered();
    return list.length > 0 && list.every((p) => this.selected().has(p.id));
  });

  toggle(id: string) {
    const next = new Set(this.selected());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.selected.set(next);
  }

  toggleAll(checked: boolean) {
    this.selected.set(checked ? new Set(this.filtered().map((p) => p.id)) : new Set());
  }

  clearSelection() {
    this.selected.set(new Set());
  }

  /** Copias de las seleccionadas tal como están ahora, para poder deshacer el cambio. */
  private snapshotSelected(): Property[] {
    const ids = this.selected();
    return this.store
      .all()
      .filter((p) => ids.has(p.id))
      .map((p) => ({ ...p, photos: [...p.photos], amenities: [...p.amenities] }));
  }

  private applyBulk(message: (n: number) => string, run: () => number) {
    const before = this.snapshotSelected();
    const done = run();
    this.clearSelection();
    if (done === 0) {
      this.toast.show('No se pudo cambiar ninguna: no tenés permiso sobre las seleccionadas.');
      return;
    }
    this.toast.show(message(done), {
      actionLabel: 'Deshacer',
      action: () => {
        const restored = this.store.restore(before);
        this.toast.show(`Se deshizo el cambio en ${restored} ${restored === 1 ? 'propiedad' : 'propiedades'}.`);
      },
    });
  }

  private plural(n: number): string {
    return `${n} ${n === 1 ? 'propiedad' : 'propiedades'}`;
  }

  bulkStatus(status: string) {
    if (!status) return;
    const ids = [...this.selected()];
    this.applyBulk(
      (n) => `Cambiaste el estado de ${this.plural(n)}.`,
      () => this.store.bulkUpdate(ids, { status: status as PropertyStatus })
    );
  }

  bulkAgent(userId: string) {
    if (userId === '__none') return;
    const ids = [...this.selected()];
    this.applyBulk(
      (n) => `Actualizaste el responsable de ${this.plural(n)}.`,
      () => this.store.bulkUpdate(ids, { agentId: userId })
    );
  }

  bulkBranch(branch: string) {
    if (branch === '__none') return;
    const ids = [...this.selected()];
    this.applyBulk(
      (n) => `Actualizaste la sucursal de ${this.plural(n)}.`,
      () => this.store.bulkUpdate(ids, { branch: branch as PropertyBranch })
    );
  }

  bulkRemove() {
    const count = this.selected().size;
    if (!confirm(`¿Eliminar ${this.plural(count)}?`)) return;
    const ids = [...this.selected()];
    this.applyBulk(
      (n) => `Eliminaste ${this.plural(n)}.`,
      () => this.store.removeMany(ids)
    );
  }

  /** Cierra el menú «Más acciones» después de elegir una opción. */
  closeMenu(event: Event) {
    (event.currentTarget as HTMLElement).closest('details')?.removeAttribute('open');
  }

  duplicate(property: Property) {
    const id = this.store.duplicate(property.id);
    if (id) {
      this.notice.set(`Se creó «Copia de ${property.title}» como pausada. Editala y publicala cuando esté lista.`);
    }
  }

  remove(property: Property) {
    const copy: Property = { ...property, photos: [...property.photos], amenities: [...property.amenities] };
    if (!this.store.remove(property.id)) return;
    this.toast.show(`Eliminaste «${property.title}».`, {
      actionLabel: 'Deshacer',
      action: () => {
        this.store.restore([copy]);
        this.toast.show(`Volvió «${property.title}».`);
      },
    });
  }
}
