import { ConfirmService } from '../../data/confirm.service';
import { ToastService } from '../../data/toast.service';
import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../data/auth.service';
import {
  ContactsStore,
  VISIT_STATUS_LABELS,
  VisitsStore,
  type Visit,
  type VisitStatus,
} from '../../data/crm-stores';
import { PropertyStore } from '../../data/property-store';
import { UsersStore } from '../../data/users-store';
import { PanelShellComponent } from './panel-shell.component';

@Component({
  selector: 'app-panel-visits',
  standalone: true,
  imports: [FormsModule, DatePipe, PanelShellComponent],
  template: `
    <app-panel-shell title="Visitas">
      <p class="max-w-3xl text-sm text-muted-foreground">
        Agenda de visitas a propiedades. Al marcarlas como realizadas, la devolución de quien visitó queda disponible para el
        informe al propietario.
      </p>

      @if (auth.can('contactos.gestionar')) {
        <form class="mt-6 grid gap-3 mer-card p-4 md:grid-cols-4" (submit)="create($event)">
          <label class="md:col-span-2">
            <span class="lbl">Propiedad</span>
            <select class="inp" name="property" [(ngModel)]="draft.propertySlug">
              <option value="">Elegí una propiedad…</option>
              @for (p of properties.published(); track p.id) {
                <option [value]="p.slug">{{ p.title }}</option>
              }
            </select>
          </label>
          <label>
            <span class="lbl">Fecha y hora</span>
            <input class="inp" type="datetime-local" name="at" [(ngModel)]="draft.at" />
          </label>
          <label>
            <span class="lbl">Quién visita</span>
            <select class="inp" name="contact" [(ngModel)]="draft.contactId">
              <option value="">Otra persona (nombre libre)…</option>
              @for (c of contacts.all(); track c.id) {
                <option [value]="c.id">{{ c.name }}</option>
              }
            </select>
          </label>
          @if (!draft.contactId) {
            <label class="md:col-span-2">
              <span class="lbl">Nombre de quien visita</span>
              <input class="inp" name="visitor" [(ngModel)]="draft.visitorName" />
            </label>
          }
          <div class="md:col-span-4">
            @if (error(); as e) {
              <p class="mb-2 text-sm text-red-700" role="alert">{{ e }}</p>
            }
            <button
              type="submit"
              class="h-11 rounded-lg bg-forest-deep px-6 text-sm font-semibold text-stone-warm transition hover:bg-forest hover:text-white"
            >
              Agendar visita
            </button>
          </div>
        </form>
      }

      @for (group of groups(); track group.title) {
        <h2 class="mt-8 font-display text-xl font-medium text-forest-deep">{{ group.title }} ({{ group.items.length }})</h2>
        <ul class="mt-3 space-y-3">
          @for (v of group.items; track v.id) {
            <li class="mer-card p-4">
              <div class="flex flex-wrap items-start justify-between gap-2">
                <div class="min-w-0">
                  <p class="font-medium text-forest-deep">{{ propertyTitle(v) }}</p>
                  <p class="text-sm text-muted-foreground">
                    @if (v.status === 'solicitada') {
                      Pidió: {{ v.preferred }} · {{ visitorName(v) }}
                    } @else {
                      {{ v.at | date: "EEEE dd/MM 'a las' HH:mm" }} · {{ visitorName(v) }}
                    }
                    @if (agentName(v); as agent) { · atiende {{ agent }} }
                  </p>
                </div>
                <span
                  class="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  [class]="v.status === 'solicitada' ? 'bg-red-100 text-red-800' : 'bg-muted'"
                >
                  {{ statusLabels[v.status] }}
                </span>
              </div>

              @if (v.status === 'realizada' || v.feedback) {
                <label class="mt-3 block">
                  <span class="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">Devolución</span>
                  <textarea
                    class="mt-1 min-h-16 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-forest"
                    placeholder="¿Qué le pareció? ¿Qué objeciones tuvo?"
                    [value]="v.feedback ?? ''"
                    (change)="visits.patch(v.id, { feedback: $any($event.target).value.trim() || undefined })"
                  ></textarea>
                </label>
                <label class="mt-2 block text-xs text-muted-foreground">
                  Interés
                  <select
                    class="ml-1 h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground"
                    [ngModel]="v.interest ?? 0"
                    (ngModelChange)="visits.patch(v.id, { interest: +$event || undefined })"
                  >
                    <option value="0">Sin dato</option>
                    @for (n of [1, 2, 3, 4, 5]; track n) {
                      <option [value]="n">{{ n }} de 5</option>
                    }
                  </select>
                </label>
              }

              @if (v.status === 'solicitada' && auth.can('contactos.gestionar')) {
                <div class="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
                  <label class="text-xs text-muted-foreground">
                    Día y hora
                    <input
                      type="datetime-local"
                      class="ml-1 h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground"
                      [value]="localInput(v.at)"
                      (change)="setAt(v, $any($event.target).value)"
                    />
                  </label>
                  <button
                    type="button"
                    class="h-9 rounded-lg bg-forest-deep px-4 text-sm font-semibold text-stone-warm transition hover:bg-forest hover:text-white"
                    (click)="confirm(v)"
                  >
                    Confirmar visita
                  </button>
                  @if (v.visitorPhone) {
                    <a
                      [href]="whatsapp(v)"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm transition hover:border-forest"
                    >
                      Avisar por WhatsApp
                    </a>
                  }
                </div>
              }

              @if (auth.can('contactos.gestionar')) {
                <div class="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
                  <select
                    class="h-9 rounded-lg border border-border bg-background px-2 text-sm"
                    [ngModel]="v.status"
                    (ngModelChange)="visits.patch(v.id, { status: $event })"
                    aria-label="Estado de la visita"
                  >
                    @for (s of statusOptions; track s.id) {
                      <option [value]="s.id">{{ s.label }}</option>
                    }
                  </select>
                  <button
                    type="button"
                    class="ml-auto h-9 rounded-lg border border-border px-3 text-sm text-red-700 transition hover:border-red-400"
                    (click)="remove(v)"
                  >
                    Eliminar
                  </button>
                </div>
              }
            </li>
          }
        </ul>
      } @empty {
        <p class="mt-8 rounded-xl border border-dashed border-border bg-background p-8 text-center text-muted-foreground">
          Todavía no hay visitas agendadas.
        </p>
      }
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
export class PanelVisitsComponent {
  protected readonly dialog = inject(ConfirmService);
  protected readonly toast = inject(ToastService);
  readonly auth = inject(AuthService);
  readonly visits = inject(VisitsStore);
  readonly contacts = inject(ContactsStore);
  readonly properties = inject(PropertyStore);
  private readonly users = inject(UsersStore);

  readonly statusLabels = VISIT_STATUS_LABELS;
  readonly statusOptions = (Object.keys(VISIT_STATUS_LABELS) as VisitStatus[]).map((id) => ({
    id,
    label: VISIT_STATUS_LABELS[id],
  }));
  readonly error = signal<string | null>(null);
  draft = { propertySlug: '', at: '', contactId: '', visitorName: '' };

  readonly groups = computed(() => {
    const now = Date.now();
    const sorted = [...this.visits.all()].sort((a, b) => a.at.localeCompare(b.at));
    const requested = sorted.filter((v) => v.status === 'solicitada');
    const upcoming = sorted.filter((v) => v.status === 'programada' && new Date(v.at).getTime() >= now - 3_600_000);
    const pending = sorted.filter((v) => v.status === 'programada' && new Date(v.at).getTime() < now - 3_600_000);
    const done = sorted.filter((v) => v.status === 'realizada' || v.status === 'cancelada').reverse();
    return [
      { title: 'Para confirmar (pidieron una visita desde el sitio)', items: requested },
      { title: 'Próximas', items: upcoming },
      { title: 'Para cerrar (ya pasaron y siguen programadas)', items: pending },
      { title: 'Realizadas y canceladas', items: done },
    ].filter((g) => g.items.length > 0);
  });

  propertyTitle(v: Visit): string {
    return this.properties.getBySlug(v.propertySlug)?.title ?? v.propertySlug;
  }

  visitorName(v: Visit): string {
    return (v.contactId ? this.contacts.get(v.contactId)?.name : v.visitorName) ?? 'Sin nombre';
  }

  agentName(v: Visit): string {
    return (v.agentId ? this.users.getById(v.agentId)?.name : '') ?? '';
  }

  /** Valor para un campo datetime-local a partir de una fecha ISO. */
  localInput(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  setAt(v: Visit, local: string) {
    if (local) this.visits.patch(v.id, { at: new Date(local).toISOString() });
  }

  confirm(v: Visit) {
    this.visits.patch(v.id, { status: 'programada', agentId: v.agentId ?? this.auth.user()?.id });
  }

  whatsapp(v: Visit): string {
    const phone = (v.visitorPhone ?? '').replace(/\D/g, '');
    const when = new Date(v.at).toLocaleString('es-AR', { weekday: 'long', day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' });
    const text = `Hola ${v.visitorName ?? ''}, te confirmamos la visita a "${this.propertyTitle(v)}" para el ${when}. ¡Te esperamos!`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }

  create(event: Event) {
    event.preventDefault();
    const d = this.draft;
    if (!d.propertySlug || !d.at) {
      this.error.set('Elegí la propiedad y la fecha y hora de la visita.');
      this.toast.error('Elegí la propiedad y la fecha y hora de la visita.');
      return;
    }
    if (!d.contactId && !d.visitorName.trim()) {
      this.error.set('Indicá quién visita: elegí un contacto o escribí el nombre.');
      this.toast.error('Indicá quién visita.');
      return;
    }
    this.error.set(null);
    this.visits.save({
      id: this.visits.newId('v'),
      propertySlug: d.propertySlug,
      contactId: d.contactId || undefined,
      visitorName: d.contactId ? undefined : d.visitorName.trim(),
      at: new Date(d.at).toISOString(),
      status: 'programada',
      agentId: this.auth.user()?.id,
    });
    this.toast.success('Visita agendada.');
    this.draft = { propertySlug: '', at: '', contactId: '', visitorName: '' };
  }

  async remove(v: Visit) {
    if (!(await this.dialog.confirm({ title: '¿Eliminar esta visita?', confirmLabel: 'Eliminar', danger: true }))) return;
    this.visits.remove(v.id);
    this.toast.success('Visita eliminada.');
  }
}
