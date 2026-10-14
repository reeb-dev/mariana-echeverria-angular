import { ToastService } from '../../data/toast.service';
import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReminderButtonComponent } from '../../components/reminder-button.component';
import { AuthService } from '../../data/auth.service';
import { samePhone } from '../../data/collection-store';
import { ContactsStore } from '../../data/crm-stores';
import {
  APPRAISAL_REASON_LABELS,
  APPRAISAL_STATUS_LABELS,
  AppraisalsStore,
  type Appraisal,
  type AppraisalStatus,
} from '../../data/appraisals-store';
import { UsersStore } from '../../data/users-store';
import { PanelShellComponent } from './panel-shell.component';

/** Horas desde el pedido sin haberlo entregado: la promesa del sitio es «en el día». */
const SLA_HOURS = 24;

@Component({
  selector: 'app-panel-appraisals',
  standalone: true,
  imports: [FormsModule, DatePipe, PanelShellComponent, ReminderButtonComponent],
  template: `
    <app-panel-shell title="Tasaciones">
      <p class="max-w-3xl text-sm text-muted-foreground">
        Pedidos que llegan desde «Pedí tu tasación». La promesa del sitio es entregarla en el día: los que pasan de
        {{ slaHours }} horas sin entregarse se marcan en rojo.
      </p>

      <div class="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por estado">
        @for (f of filters; track f.id) {
          <button
            type="button"
            class="filter-chip"
            [class.filter-chip-active]="filter() === f.id"
            [class.filter-chip-idle]="filter() !== f.id"
            (click)="filter.set(f.id)"
          >
            {{ f.label }}
          </button>
        }
        <p class="ml-auto text-sm tabular-nums text-muted-foreground">{{ filtered().length }} pedidos</p>
      </div>

      <ul class="mt-6 space-y-3">
        @for (a of filtered(); track a.id) {
          <li class="rounded-xl border bg-background p-4" [class]="overdue(a) ? 'border-red-300' : 'border-border'">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="font-medium text-forest-deep">{{ a.name }}</p>
                <p class="text-sm text-muted-foreground">
                  {{ a.at | date: 'dd/MM/yyyy HH:mm' }} · {{ reasonLabels[a.reason] }}
                </p>
              </div>
              <div class="flex flex-col items-end gap-1">
                <span class="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold">{{ statusLabels[a.status] }}</span>
                @if (overdue(a)) {
                  <span class="text-xs font-semibold text-red-700">Pasó de {{ slaHours }} h sin entregar</span>
                } @else if (a.status === 'nueva' || a.status === 'relevamiento') {
                  <span class="text-xs text-muted-foreground">Hace {{ hoursSince(a) }} h</span>
                }
              </div>
            </div>

            <p class="mt-3 text-sm">
              <strong class="capitalize">{{ a.propertyType }}</strong> en {{ a.address }}
              @if (a.area) { · {{ a.area }} }
            </p>
            @if (a.details) {
              <p class="mt-2 text-sm leading-relaxed text-muted-foreground">{{ a.details }}</p>
            }
            <p class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <a [href]="'tel:' + a.phone" class="text-forest underline underline-offset-2">{{ a.phone }}</a>
              <a [href]="whatsappUrl(a)" target="_blank" rel="noopener noreferrer" class="text-forest underline underline-offset-2">
                WhatsApp
              </a>
              @if (a.email) {
                <a [href]="'mailto:' + a.email" class="text-forest underline underline-offset-2">{{ a.email }}</a>
              }
            </p>

            <div class="mt-4 grid gap-3 border-t border-border/60 pt-3 md:grid-cols-2">
              <label class="text-xs text-muted-foreground">
                Valor entregado
                <input
                  class="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-forest disabled:opacity-60"
                  placeholder="Ej.: USD 48.000 a 52.000"
                  [value]="a.valueDelivered ?? ''"
                  [disabled]="!auth.can('consultas.gestionar')"
                  (change)="store.update(a.id, { valueDelivered: $any($event.target).value.trim() || undefined }); toast.success('Valor guardado.')"
                />
              </label>
              <label class="text-xs text-muted-foreground">
                Notas internas
                <input
                  class="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-forest disabled:opacity-60"
                  placeholder="Ej.: visita el jueves 10 hs"
                  [value]="a.notes ?? ''"
                  [disabled]="!auth.can('consultas.gestionar')"
                  (change)="store.update(a.id, { notes: $any($event.target).value.trim() || undefined }); toast.success('Nota guardada.')"
                />
              </label>
            </div>

            <div class="mt-3 flex flex-wrap items-center gap-2">
              <label class="text-xs text-muted-foreground">
                Estado
                <select
                  class="ml-1 h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground disabled:opacity-60"
                  [ngModel]="a.status"
                  (ngModelChange)="store.setStatus(a.id, $event); toast.success('Estado actualizado.')"
                  [disabled]="!auth.can('consultas.gestionar')"
                >
                  @for (s of statusOptions; track s.id) {
                    <option [value]="s.id">{{ s.label }}</option>
                  }
                </select>
              </label>
              <label class="text-xs text-muted-foreground">
                Atiende
                <select
                  class="ml-1 h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground disabled:opacity-60"
                  [ngModel]="a.assignedTo ?? ''"
                  (ngModelChange)="store.update(a.id, { assignedTo: $event || undefined }); toast.success('Responsable actualizado.')"
                  [disabled]="!auth.can('consultas.asignar')"
                >
                  <option value="">Sin asignar</option>
                  @for (u of assignable(); track u.id) {
                    <option [value]="u.id">{{ u.name }}</option>
                  }
                </select>
              </label>
              @if (auth.can('consultas.gestionar')) {
                <app-reminder-button [context]="'Tasación de ' + a.name" suggestion="Coordinar el relevamiento" />
              }
              @if (auth.can('contactos.gestionar')) {
                <button
                  type="button"
                  class="h-9 rounded-lg border border-border px-3 text-sm font-medium transition hover:border-forest disabled:opacity-60"
                  [disabled]="isContact(a)"
                  (click)="saveContact(a)"
                >
                  {{ isContact(a) ? 'Ya es contacto' : 'Guardar como propietario' }}
                </button>
              }
              @if (auth.can('consultas.asignar')) {
                <button
                  type="button"
                  class="ml-auto h-9 rounded-lg border border-border px-3 text-sm font-medium text-red-700 transition hover:border-red-400"
                  (click)="remove(a)"
                >
                  Eliminar
                </button>
              }
            </div>
          </li>
        } @empty {
          <li class="rounded-xl border border-dashed border-border bg-background p-8 text-center text-muted-foreground">
            No hay pedidos de tasación en esta vista.
          </li>
        }
      </ul>
    </app-panel-shell>
  `,
})
export class PanelAppraisalsComponent {
  protected readonly toast = inject(ToastService);
  readonly store = inject(AppraisalsStore);
  readonly auth = inject(AuthService);
  private readonly users = inject(UsersStore);
  private readonly contacts = inject(ContactsStore);

  readonly slaHours = SLA_HOURS;
  readonly statusLabels = APPRAISAL_STATUS_LABELS;
  readonly reasonLabels = APPRAISAL_REASON_LABELS;
  readonly statusOptions = (Object.keys(APPRAISAL_STATUS_LABELS) as AppraisalStatus[]).map((id) => ({
    id,
    label: APPRAISAL_STATUS_LABELS[id],
  }));
  readonly filters: { id: 'todas' | AppraisalStatus; label: string }[] = [
    { id: 'todas', label: 'Todas' },
    ...this.statusOptions,
  ];
  readonly filter = signal<'todas' | AppraisalStatus>('todas');

  readonly assignable = computed(() =>
    this.users.all().filter((u) => u.active && (u.role === 'titular' || u.role === 'agente'))
  );

  readonly filtered = computed(() =>
    this.store.all().filter((a) => this.filter() === 'todas' || a.status === this.filter())
  );

  hoursSince(a: Appraisal): number {
    return Math.max(0, Math.floor((Date.now() - new Date(a.at).getTime()) / 3_600_000));
  }

  /** Pedidos todavía sin entregar que pasaron del plazo prometido. */
  overdue(a: Appraisal): boolean {
    return (a.status === 'nueva' || a.status === 'relevamiento') && this.hoursSince(a) >= SLA_HOURS;
  }

  isContact(a: Appraisal): boolean {
    return this.contacts.all().some((c) => samePhone(c.phone, a.phone));
  }

  saveContact(a: Appraisal) {
    if (this.isContact(a)) return;
    this.contacts.save({
      id: this.contacts.newId('c'),
      name: a.name,
      phone: a.phone,
      email: a.email,
      kind: 'propietario',
      notes: `Pidió tasación de ${a.propertyType} en ${a.address}.`,
      createdAt: new Date().toISOString(),
    });
    this.toast.success(`${a.name} se guardó en contactos.`);
  }

  whatsappUrl(a: Appraisal) {
    const digits = a.phone.replace(/\D/g, '');
    const text = encodeURIComponent(`Hola ${a.name}, te escribimos por tu pedido de tasación.`);
    return `https://wa.me/${digits}?text=${text}`;
  }

  remove(a: Appraisal) {
    if (confirm(`¿Eliminar el pedido de ${a.name}?`)) {
      this.store.remove(a.id);
      this.toast.success('Pedido eliminado.');
    }
  }
}
