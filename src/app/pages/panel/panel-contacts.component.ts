import { ConfirmService } from '../../data/confirm.service';
import { ToastService } from '../../data/toast.service';
import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReminderButtonComponent } from '../../components/reminder-button.component';
import { AppraisalsStore, APPRAISAL_REASON_LABELS } from '../../data/appraisals-store';
import { AuthService } from '../../data/auth.service';
import { digits, samePhone } from '../../data/collection-store';
import {
  CONTACT_KIND_LABELS,
  ContactsStore,
  LeasesStore,
  SavedSearchesStore,
  VisitsStore,
  type ContactKind,
  type CrmContact,
} from '../../data/crm-stores';
import { InquiriesStore } from '../../data/inquiries-store';
import { PropertyStore } from '../../data/property-store';
import { PanelShellComponent } from './panel-shell.component';

type TimelineEntry = { at: string; label: string; detail: string; link?: string[] };

@Component({
  selector: 'app-panel-contacts',
  standalone: true,
  imports: [FormsModule, DatePipe, RouterLink, PanelShellComponent, ReminderButtonComponent],
  template: `
    <app-panel-shell title="Contactos">
      <p class="max-w-3xl text-sm text-muted-foreground">
        Compradores, propietarios e inquilinos en un solo lugar, con todo lo que pasó con cada uno: consultas, tasaciones, visitas,
        búsquedas y contratos.
      </p>

      <div class="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <!-- Lista -->
        <section>
          <div class="flex flex-wrap gap-3">
            <input
              type="search"
              placeholder="Buscar por nombre, teléfono o mail…"
              class="h-11 min-w-0 flex-1 rounded-lg border border-border bg-background px-3.5 text-sm outline-none focus:border-forest"
              [ngModel]="query()"
              (ngModelChange)="query.set($event)"
              aria-label="Buscar contactos"
            />
            <select
              class="h-11 rounded-lg border border-border bg-background px-3 text-sm"
              [ngModel]="kindFilter()"
              (ngModelChange)="kindFilter.set($event)"
              aria-label="Filtrar por tipo"
            >
              <option value="todos">Todos</option>
              @for (k of kinds; track k.id) {
                <option [value]="k.id">{{ k.label }}</option>
              }
            </select>
          </div>
          <ul class="mt-4 space-y-2">
            @for (c of filtered(); track c.id) {
              <li>
                <button
                  type="button"
                  class="w-full rounded-xl border bg-background p-3 text-left transition hover:border-forest"
                  [class]="selectedId() === c.id ? 'border-forest' : 'border-border'"
                  (click)="select(c.id)"
                >
                  <span class="block font-medium text-forest-deep">{{ c.name }}</span>
                  <span class="block text-xs text-muted-foreground">
                    {{ kindLabels[c.kind] }} · {{ c.phone || c.email || 'sin datos de contacto' }}
                  </span>
                </button>
              </li>
            } @empty {
              <li class="rounded-xl border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
                No hay contactos con esa búsqueda.
              </li>
            }
          </ul>

          @if (auth.can('contactos.gestionar')) {
            <form class="mt-6 space-y-3 mer-card p-4" (submit)="create($event)">
              <p class="font-semibold text-forest-deep">Nuevo contacto</p>
              <input class="inp" name="name" placeholder="Nombre" [(ngModel)]="draft.name" />
              <input class="inp" name="phone" placeholder="Teléfono" [(ngModel)]="draft.phone" />
              <input class="inp" name="email" type="email" placeholder="Email (opcional)" [(ngModel)]="draft.email" />
              <select class="inp" name="kind" [(ngModel)]="draft.kind">
                @for (k of kinds; track k.id) {
                  <option [value]="k.id">{{ k.label }}</option>
                }
              </select>
              @if (formError(); as e) {
                <p class="text-sm text-red-700" role="alert">{{ e }}</p>
              }
              <button
                type="submit"
                class="h-11 w-full rounded-lg bg-forest-deep text-sm font-semibold text-stone-warm transition hover:bg-forest hover:text-white"
              >
                Guardar contacto
              </button>
            </form>
          }
        </section>

        <!-- Detalle -->
        <section>
          @if (selected(); as c) {
            <div class="mer-card p-5">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 class="font-display text-xl font-medium text-forest-deep">{{ c.name }}</h2>
                  <p class="text-sm text-muted-foreground">
                    {{ kindLabels[c.kind] }} · cargado el {{ c.createdAt | date: 'dd/MM/yyyy' }}
                  </p>
                </div>
                @if (auth.can('contactos.gestionar')) {
                  <button
                    type="button"
                    class="h-9 rounded-lg border border-border px-3 text-sm text-red-700 transition hover:border-red-400"
                    (click)="remove(c)"
                  >
                    Eliminar
                  </button>
                }
              </div>
              <p class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                @if (c.phone) {
                  <a [href]="'tel:' + c.phone" class="text-forest underline underline-offset-2">{{ c.phone }}</a>
                  <a [href]="whatsapp(c)" target="_blank" rel="noopener noreferrer" class="text-forest underline underline-offset-2">
                    WhatsApp
                  </a>
                }
                @if (c.email) {
                  <a [href]="'mailto:' + c.email" class="text-forest underline underline-offset-2">{{ c.email }}</a>
                }
              </p>

              @if (auth.can('contactos.gestionar')) {
                <div class="mt-4">
                  <app-reminder-button [context]="'Contacto: ' + c.name" [suggestion]="'Llamar a ' + c.name" />
                </div>
              }

              <label class="mt-4 block">
                <span class="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">Notas</span>
                <textarea
                  class="mt-1 min-h-20 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-forest disabled:opacity-60"
                  [value]="c.notes ?? ''"
                  [disabled]="!auth.can('contactos.gestionar')"
                  (change)="contacts.patch(c.id, { notes: $any($event.target).value.trim() || undefined })"
                ></textarea>
              </label>
              <label class="mt-3 block text-xs text-muted-foreground">
                Tipo
                <select
                  class="ml-1 h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground disabled:opacity-60"
                  [ngModel]="c.kind"
                  (ngModelChange)="contacts.patch(c.id, { kind: $event })"
                  [disabled]="!auth.can('contactos.gestionar')"
                >
                  @for (k of kinds; track k.id) {
                    <option [value]="k.id">{{ k.label }}</option>
                  }
                </select>
              </label>

              <h3 class="mt-6 font-display text-lg font-medium text-forest-deep">Historial</h3>
              <ol class="mt-3 space-y-3 border-l-2 border-border pl-4">
                @for (e of timeline(); track e.at + e.label) {
                  <li>
                    <p class="text-xs text-muted-foreground">{{ e.at | date: 'dd/MM/yyyy HH:mm' }}</p>
                    <p class="text-sm font-medium text-forest-deep">{{ e.label }}</p>
                    @if (e.detail) {
                      <p class="text-sm text-muted-foreground">{{ e.detail }}</p>
                    }
                    @if (e.link) {
                      <a [routerLink]="e.link" class="text-sm text-forest underline underline-offset-2">Abrir</a>
                    }
                  </li>
                } @empty {
                  <li class="text-sm text-muted-foreground">Todavía no hay movimientos con este contacto.</li>
                }
              </ol>
            </div>
          } @else {
            <div class="rounded-xl border border-dashed border-border bg-background p-10 text-center text-muted-foreground">
              Elegí un contacto para ver su historial.
            </div>
          }
        </section>
      </div>
    </app-panel-shell>
  `,
  styles: [
    `
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
        border-color: #d06a28;
      }
    `,
  ],
})
export class PanelContactsComponent {
  protected readonly dialog = inject(ConfirmService);
  protected readonly toast = inject(ToastService);
  readonly auth = inject(AuthService);
  readonly contacts = inject(ContactsStore);
  private readonly inquiries = inject(InquiriesStore);
  private readonly appraisals = inject(AppraisalsStore);
  private readonly visits = inject(VisitsStore);
  private readonly searches = inject(SavedSearchesStore);
  private readonly leases = inject(LeasesStore);
  private readonly properties = inject(PropertyStore);

  readonly kindLabels = CONTACT_KIND_LABELS;
  readonly kinds = (Object.keys(CONTACT_KIND_LABELS) as ContactKind[]).map((id) => ({ id, label: CONTACT_KIND_LABELS[id] }));

  readonly query = signal('');
  readonly kindFilter = signal<'todos' | ContactKind>('todos');
  private readonly route = inject(ActivatedRoute);
  readonly selectedId = signal<string | null>(this.route.snapshot.queryParamMap.get('id'));
  readonly formError = signal<string | null>(null);
  draft = { name: '', phone: '', email: '', kind: 'comprador' as ContactKind };

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const qd = digits(q);
    return this.contacts
      .all()
      .filter((c) => {
        if (this.kindFilter() !== 'todos' && c.kind !== this.kindFilter()) return false;
        if (!q) return true;
        return (
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (qd.length >= 3 && digits(c.phone).includes(qd))
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  });

  readonly selected = computed(() => {
    const id = this.selectedId();
    return id ? this.contacts.get(id) ?? null : null;
  });

  /** Todo lo que se relaciona con el contacto por teléfono o mail, o por vínculo directo. */
  readonly timeline = computed<TimelineEntry[]>(() => {
    const c = this.selected();
    if (!c) return [];
    const matches = (phone?: string, email?: string) =>
      samePhone(c.phone, phone) || (!!c.email && !!email && c.email.toLowerCase() === email.toLowerCase());
    const entries: TimelineEntry[] = [];

    for (const q of this.inquiries.all()) {
      if (matches(q.phone, q.email)) {
        entries.push({
          at: q.at,
          label: q.propertyTitle ? `Consultó por «${q.propertyTitle}»` : 'Consulta desde el sitio',
          detail: q.message ?? '',
          link: ['/panel/consultas'],
        });
      }
    }
    for (const a of this.appraisals.all()) {
      if (matches(a.phone, a.email)) {
        entries.push({
          at: a.at,
          label: `Pidió una tasación (${APPRAISAL_REASON_LABELS[a.reason]})`,
          detail: `${a.propertyType} en ${a.address}${a.valueDelivered ? ` · valor entregado: ${a.valueDelivered}` : ''}`,
          link: ['/panel/tasaciones'],
        });
      }
    }
    for (const v of this.visits.all()) {
      if (v.contactId === c.id) {
        const p = this.properties.getBySlug(v.propertySlug);
        entries.push({
          at: v.at,
          label: `Visita ${v.status}: ${p?.title ?? v.propertySlug}`,
          detail: v.feedback ?? '',
          link: ['/panel/visitas'],
        });
      }
    }
    for (const s of this.searches.all()) {
      if (s.contactId === c.id) {
        entries.push({
          at: s.createdAt,
          label: 'Búsqueda guardada',
          detail: [s.operation, s.type, s.maxPrice ? `hasta ${s.currency} ${s.maxPrice.toLocaleString('es-AR')}` : '']
            .filter(Boolean)
            .join(' · '),
          link: ['/panel/busquedas'],
        });
      }
    }
    for (const l of this.leases.all()) {
      if (l.tenantContactId === c.id) {
        entries.push({
          at: l.startDate,
          label: `Contrato de ${l.kind === 'rural' ? 'arrendamiento' : 'locación'}: ${l.propertyLabel}`,
          detail: `Vence el ${l.endDate}`,
          link: ['/panel/contratos'],
        });
      }
    }
    entries.push({ at: c.createdAt, label: 'Contacto cargado', detail: '' });
    return entries.sort((a, b) => b.at.localeCompare(a.at));
  });

  select(id: string) {
    this.selectedId.set(id);
  }

  whatsapp(c: CrmContact) {
    return `https://wa.me/${digits(c.phone)}`;
  }

  create(event: Event) {
    event.preventDefault();
    const d = this.draft;
    if (!d.name.trim() || (!d.phone.trim() && !d.email.trim())) {
      this.formError.set('Cargá el nombre y al menos un teléfono o un mail.');
      return;
    }
    const duplicate = this.contacts.all().find((c) => samePhone(c.phone, d.phone));
    if (duplicate) {
      this.formError.set(`Ya existe ese teléfono: ${duplicate.name}.`);
      this.toast.error(`Ya existe ese teléfono: ${duplicate.name}.`);
      this.selectedId.set(duplicate.id);
      return;
    }
    this.formError.set(null);
    const id = this.contacts.newId('c');
    this.contacts.save({
      id,
      name: d.name.trim(),
      phone: d.phone.trim(),
      email: d.email.trim(),
      kind: d.kind,
      createdAt: new Date().toISOString(),
    });
    this.selectedId.set(id);
    this.toast.success('Contacto creado.');
    this.draft = { name: '', phone: '', email: '', kind: 'comprador' };
  }

  async remove(c: CrmContact) {
    if (!(await this.dialog.confirm({ title: `¿Eliminar a ${c.name}?`, message: 'Las consultas y tasaciones quedan, solo se borra la ficha.', confirmLabel: 'Eliminar', danger: true }))) return;
    this.contacts.remove(c.id);
    this.selectedId.set(null);
    this.toast.success('Contacto eliminado.');
  }
}
