import { ConfirmService } from '../../data/confirm.service';
import { ToastService } from '../../data/toast.service';
import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReminderButtonComponent } from '../../components/reminder-button.component';
import { AuthService } from '../../data/auth.service';
import { samePhone } from '../../data/collection-store';
import { ContactsStore } from '../../data/crm-stores';
import {
  INQUIRY_STATUS_LABELS,
  InquiriesStore,
  type Inquiry,
  type InquiryStatus,
} from '../../data/inquiries-store';
import { UsersStore } from '../../data/users-store';
import { PanelShellComponent } from './panel-shell.component';

@Component({
  selector: 'app-panel-inquiries',
  standalone: true,
  imports: [FormsModule, DatePipe, PanelShellComponent, ReminderButtonComponent],
  template: `
    <app-panel-shell title="Consultas">
      <div class="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por estado">
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
        <input
          type="search"
          placeholder="Buscar por nombre, mail o mensaje…"
          class="h-10 min-w-0 flex-1 rounded-lg border border-border bg-background px-3.5 text-sm outline-none focus:border-forest md:max-w-xs md:flex-none"
          [ngModel]="query()"
          (ngModelChange)="query.set($event)"
          aria-label="Buscar consultas"
        />
        <label class="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" [ngModel]="onlyMine()" (ngModelChange)="onlyMine.set($event)" />
          Asignadas a mí
        </label>
        <p class="ml-auto text-sm tabular-nums text-muted-foreground">
          {{ filtered().length }} {{ filtered().length === 1 ? 'consulta' : 'consultas' }}
        </p>
      </div>

      <ul class="mt-6 space-y-3">
        @for (q of filtered(); track q.id) {
          <li class="mer-card p-4">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="font-medium text-forest-deep">{{ q.name }}</p>
                <p class="text-sm text-muted-foreground">
                  {{ q.at | date: 'dd/MM/yyyy HH:mm' }}
                  @if (q.propertyType) { · {{ q.propertyType }} }
                  @if (q.operation) { · {{ q.operation }} }
                </p>
              </div>
              <span
                class="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                [class]="q.status === 'nueva' ? 'bg-forest text-white' : 'bg-muted text-muted-foreground'"
              >
                {{ labels[q.status] }}
              </span>
            </div>
            @if (q.propertyTitle) {
              <p class="mt-3 text-sm">
                <span class="text-muted-foreground">Consultó por:</span>
                @if (q.propertySlug) {
                  <a [href]="'/propiedades/' + q.propertySlug" target="_blank" class="font-medium text-forest underline underline-offset-2">
                    {{ q.propertyTitle }}
                  </a>
                } @else {
                  <span class="font-medium">{{ q.propertyTitle }}</span>
                }
              </p>
            }
            @if (q.message) {
              <p class="mt-3 text-sm leading-relaxed">{{ q.message }}</p>
            }
            <p class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              @if (q.email) {
                <a [href]="'mailto:' + q.email" class="text-forest underline underline-offset-2">{{ q.email }}</a>
              }
              <a [href]="whatsappUrl(q)" target="_blank" rel="noopener noreferrer" class="text-forest underline underline-offset-2">
                WhatsApp {{ q.phone }}
              </a>
            </p>
            <label class="mt-4 block">
              <span class="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">Notas internas</span>
              <textarea
                class="mt-1 min-h-16 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-forest disabled:opacity-60"
                placeholder="Ej.: la llamé el martes, quiere visitar el sábado."
                [value]="q.notes ?? ''"
                [disabled]="!auth.can('consultas.gestionar')"
                (change)="store.setNotes(q.id, $any($event.target).value); toast.success('Nota guardada.')"
              ></textarea>
            </label>
            <div class="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
              <label class="text-xs text-muted-foreground">
                Estado
                <select
                  class="ml-1 h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground disabled:opacity-60"
                  [ngModel]="q.status"
                  (ngModelChange)="store.setStatus(q.id, $event); toast.success('Estado actualizado.')"
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
                  [ngModel]="q.assignedTo ?? ''"
                  (ngModelChange)="store.assign(q.id, $event || undefined)"
                  [disabled]="!auth.can('consultas.asignar')"
                >
                  <option value="">Sin asignar</option>
                  @for (u of assignable(); track u.id) {
                    <option [value]="u.id">{{ u.name }}</option>
                  }
                </select>
              </label>
              @if (auth.can('consultas.gestionar')) {
                <app-reminder-button [context]="'Consulta de ' + q.name" suggestion="Responder la consulta" />
              }
              @if (auth.can('contactos.gestionar')) {
                <button
                  type="button"
                  class="h-9 rounded-lg border border-border px-3 text-sm font-medium transition hover:border-forest disabled:opacity-60"
                  [disabled]="isContact(q)"
                  (click)="saveContact(q)"
                >
                  {{ isContact(q) ? 'Ya es contacto' : 'Guardar como contacto' }}
                </button>
              }
              @if (auth.can('consultas.asignar')) {
                <button
                  type="button"
                  class="ml-auto h-9 rounded-lg border border-border px-3 text-sm font-medium text-red-700 transition hover:border-red-400"
                  (click)="remove(q)"
                >
                  Eliminar
                </button>
              }
            </div>
          </li>
        } @empty {
          <li class="rounded-xl border border-dashed border-border bg-background p-8 text-center text-muted-foreground">
            No hay consultas en esta vista.
          </li>
        }
      </ul>
    </app-panel-shell>
  `,
})
export class PanelInquiriesComponent {
  protected readonly dialog = inject(ConfirmService);
  protected readonly toast = inject(ToastService);
  readonly store = inject(InquiriesStore);
  readonly auth = inject(AuthService);
  private readonly users = inject(UsersStore);
  private readonly contacts = inject(ContactsStore);

  readonly labels = INQUIRY_STATUS_LABELS;
  readonly statusOptions = (Object.keys(INQUIRY_STATUS_LABELS) as InquiryStatus[]).map((id) => ({
    id,
    label: INQUIRY_STATUS_LABELS[id],
  }));
  readonly filters: { id: 'todas' | InquiryStatus; label: string }[] = [
    { id: 'todas', label: 'Todas' },
    ...this.statusOptions,
  ];
  readonly filter = signal<'todas' | InquiryStatus>('todas');
  readonly query = signal('');
  readonly onlyMine = signal(false);

  /** Quienes pueden atender consultas: titular y agentes activos. */
  readonly assignable = computed(() =>
    this.users.all().filter((u) => u.active && (u.role === 'titular' || u.role === 'agente'))
  );

  readonly filtered = computed(() => {
    const text = this.query().trim().toLowerCase();
    const me = this.onlyMine() ? this.auth.user()?.id : null;
    return this.store.all().filter((q) => {
      if (this.filter() !== 'todas' && q.status !== this.filter()) return false;
      if (me && q.assignedTo !== me) return false;
      if (!text) return true;
      return `${q.name} ${q.email} ${q.phone} ${q.message ?? ''} ${q.notes ?? ''}`.toLowerCase().includes(text);
    });
  });

  isContact(q: Inquiry): boolean {
    return this.contacts.all().some((c) => samePhone(c.phone, q.phone));
  }

  saveContact(q: Inquiry) {
    if (this.isContact(q)) return;
    this.contacts.save({
      id: this.contacts.newId('c'),
      name: q.name,
      phone: q.phone,
      email: q.email,
      kind: q.operation === 'alquiler' ? 'inquilino' : 'comprador',
      notes: q.message,
      createdAt: new Date().toISOString(),
    });
    this.toast.success(`${q.name} se guardó en contactos.`);
  }

  whatsappUrl(q: Inquiry) {
    const digits = q.phone.replace(/\D/g, '');
    const text = encodeURIComponent(`Hola ${q.name}, te escribimos por tu consulta en el sitio.`);
    return `https://wa.me/${digits}?text=${text}`;
  }

  async remove(q: Inquiry) {
    if (!(await this.dialog.confirm({ title: `¿Eliminar la consulta de ${q.name}?`, message: 'No se puede deshacer.', confirmLabel: 'Eliminar', danger: true }))) return;
    this.store.remove(q.id);
    this.toast.success('Consulta eliminada.');
  }
}
