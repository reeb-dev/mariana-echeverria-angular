import { ConfirmService } from '../../data/confirm.service';
import { ToastService } from '../../data/toast.service';
import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../data/auth.service';
import { digits } from '../../data/collection-store';
import { ContactsStore, SavedSearchesStore, type SavedSearch } from '../../data/crm-stores';
import { PropertyStore } from '../../data/property-store';
import { CONTACT, labelForZone, zoneFilterOptionsFrom, type Property } from '../../data/properties';
import { matchesSearch } from '../../data/search-match';
import { PanelShellComponent } from './panel-shell.component';

@Component({
  selector: 'app-panel-searches',
  standalone: true,
  imports: [FormsModule, DatePipe, RouterLink, PanelShellComponent],
  template: `
    <app-panel-shell title="Búsquedas guardadas">
      <p class="max-w-3xl text-sm text-muted-foreground">
        Lo que busca cada comprador. Cuando entra una propiedad que coincide, aparece acá para avisarle con un toque. También
        llegan desde el sitio, con «Avisame cuando salga algo así».
      </p>

      @if (auth.can('contactos.gestionar')) {
        <form class="mt-6 grid gap-3 mer-card p-4 md:grid-cols-3" (submit)="create($event)">
          <label class="md:col-span-3">
            <span class="lbl">Contacto</span>
            <select class="inp" name="contact" [(ngModel)]="draft.contactId">
              <option value="">Elegí un contacto…</option>
              @for (c of contacts.all(); track c.id) {
                <option [value]="c.id">{{ c.name }}</option>
              }
            </select>
          </label>
          <label>
            <span class="lbl">Operación</span>
            <select class="inp" name="operation" [(ngModel)]="draft.operation">
              <option value="">Cualquiera</option>
              <option value="venta">Venta</option>
              <option value="alquiler">Alquiler</option>
            </select>
          </label>
          <label>
            <span class="lbl">Tipo</span>
            <select class="inp" name="type" [(ngModel)]="draft.type">
              <option value="">Cualquiera</option>
              @for (t of types; track t) {
                <option [value]="t" class="capitalize">{{ t }}</option>
              }
            </select>
          </label>
          <label>
            <span class="lbl">Zona</span>
            <select class="inp" name="zone" [(ngModel)]="draft.zone">
              <option value="">Cualquiera</option>
              @for (z of zones(); track z.id) {
                <option [value]="z.id">{{ z.label }}</option>
              }
            </select>
          </label>
          <label>
            <span class="lbl">Precio máximo</span>
            <input class="inp" type="number" min="0" name="max" [(ngModel)]="draft.maxPrice" placeholder="60000" />
          </label>
          <label>
            <span class="lbl">Moneda</span>
            <select class="inp" name="currency" [(ngModel)]="draft.currency">
              <option value="USD">USD</option>
              <option value="ARS">Pesos</option>
            </select>
          </label>
          <div class="flex items-end">
            <button
              type="submit"
              class="h-11 w-full rounded-lg bg-forest-deep text-sm font-semibold text-stone-warm transition hover:bg-forest hover:text-white"
            >
              Guardar búsqueda
            </button>
          </div>
          @if (error(); as e) {
            <p class="text-sm text-red-700 md:col-span-3" role="alert">{{ e }}</p>
          }
        </form>
      }

      <ul class="mt-6 space-y-3">
        @for (row of rows(); track row.search.id) {
          <li class="mer-card p-4" [class.opacity-60]="!row.search.active">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="font-medium text-forest-deep">{{ row.who }}</p>
                <p class="text-sm text-muted-foreground">{{ row.summary }} · desde {{ row.search.createdAt | date: 'dd/MM/yyyy' }}</p>
              </div>
              <span class="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                [class]="row.matches.length > 0 ? 'bg-forest text-white' : 'bg-muted text-muted-foreground'">
                {{ row.matches.length }} {{ row.matches.length === 1 ? 'coincidencia' : 'coincidencias' }}
              </span>
            </div>

            @if (row.matches.length > 0) {
              <ul class="mt-3 divide-y divide-border/70">
                @for (p of row.matches; track p.id) {
                  <li class="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                    <span class="min-w-0 flex-1 truncate">{{ p.title }} · {{ p.priceLabel }}</span>
                    <a [routerLink]="['/propiedades', p.slug]" target="_blank" class="text-forest underline underline-offset-2">Ver</a>
                  </li>
                }
              </ul>
              @if (row.whatsapp) {
                <a
                  [href]="row.whatsapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="mt-3 inline-flex h-10 items-center rounded-lg bg-forest-deep px-4 text-sm font-semibold text-stone-warm transition hover:bg-forest hover:text-white"
                >
                  Avisar por WhatsApp
                </a>
              }
            }

            @if (auth.can('contactos.gestionar')) {
              <div class="mt-3 flex gap-2 border-t border-border/60 pt-3">
                <button
                  type="button"
                  class="h-9 rounded-lg border border-border px-3 text-sm transition hover:border-forest"
                  (click)="searches.patch(row.search.id, { active: !row.search.active })"
                >
                  {{ row.search.active ? 'Pausar' : 'Reactivar' }}
                </button>
                <button
                  type="button"
                  class="h-9 rounded-lg border border-border px-3 text-sm text-red-700 transition hover:border-red-400"
                  (click)="remove(row.search)"
                >
                  Eliminar
                </button>
              </div>
            }
          </li>
        } @empty {
          <li class="rounded-xl border border-dashed border-border bg-background p-8 text-center text-muted-foreground">
            No hay búsquedas guardadas.
          </li>
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
    `,
  ],
})
export class PanelSearchesComponent {
  protected readonly dialog = inject(ConfirmService);
  protected readonly toast = inject(ToastService);
  readonly auth = inject(AuthService);
  readonly searches = inject(SavedSearchesStore);
  readonly contacts = inject(ContactsStore);
  private readonly properties = inject(PropertyStore);

  readonly error = signal<string | null>(null);
  readonly types = ['casa', 'departamento', 'local', 'lote', 'campo'];
  readonly zones = computed(() => zoneFilterOptionsFrom(this.properties.all()));
  draft = { contactId: '', operation: '', type: '', zone: '', maxPrice: null as number | null, currency: 'USD' as 'USD' | 'ARS' };

  readonly rows = computed(() => {
    const published = this.properties.published();
    return this.searches.all().map((search) => {
      const contact = search.contactId ? this.contacts.get(search.contactId) : undefined;
      const matches = search.active ? published.filter((p) => matchesSearch(search, p)) : [];
      const parts = [
        search.operation,
        search.type,
        search.zone ? labelForZone(search.zone) : '',
        search.maxPrice != null ? `hasta ${search.currency === 'USD' ? 'USD' : '$'} ${search.maxPrice.toLocaleString('es-AR')}` : '',
      ].filter(Boolean);
      const phone = contact?.phone ?? search.phone ?? '';
      return {
        search,
        who: contact?.name ?? search.name ?? 'Sin nombre',
        summary: parts.join(' · ') || 'Sin filtros: cualquier propiedad',
        matches,
        whatsapp: phone && matches.length > 0 ? this.whatsappUrl(phone, contact?.name ?? search.name ?? '', matches) : '',
      };
    });
  });

  private whatsappUrl(phone: string, name: string, matches: Property[]): string {
    const lines = [
      `Hola${name ? ` ${name}` : ''}, te escribimos de ${CONTACT.brand} porque entró algo que puede interesarte:`,
      ...matches.slice(0, 3).map((p) => `• ${p.title} (${p.priceLabel})`),
      'Si querés verlo, coordinamos una visita.',
    ];
    return `https://wa.me/${digits(phone)}?text=${encodeURIComponent(lines.join('\n'))}`;
  }

  create(event: Event) {
    event.preventDefault();
    const d = this.draft;
    if (!d.contactId) {
      this.error.set('Elegí un contacto.');
      this.toast.error('Elegí un contacto.');
      return;
    }
    this.error.set(null);
    this.searches.save({
      id: this.searches.newId('s'),
      contactId: d.contactId,
      operation: (d.operation || undefined) as SavedSearch['operation'],
      type: d.type || undefined,
      zone: d.zone || undefined,
      maxPrice: d.maxPrice ?? undefined,
      currency: d.currency,
      active: true,
      createdAt: new Date().toISOString(),
    });
    this.toast.success('Búsqueda guardada.');
    this.draft = { contactId: '', operation: '', type: '', zone: '', maxPrice: null, currency: 'USD' };
  }

  async remove(search: SavedSearch) {
    if (!(await this.dialog.confirm({ title: '¿Eliminar esta búsqueda?', confirmLabel: 'Eliminar', danger: true }))) return;
    this.searches.remove(search.id);
    this.toast.success('Búsqueda eliminada.');
  }
}
