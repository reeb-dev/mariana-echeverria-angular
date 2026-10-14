import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { daysUntil } from '../../data/calculators';
import {
  CASE_CHECKLISTS,
  CASE_KIND_LABELS,
  CasesStore,
  ContactsStore,
  type CaseKind,
  type LegalCase,
} from '../../data/crm-stores';
import { PanelShellComponent } from './panel-shell.component';

const STATUS_LABELS = { abierto: 'Abierto', en_tramite: 'En trámite', cerrado: 'Cerrado' } as const;

@Component({
  selector: 'app-panel-cases',
  standalone: true,
  imports: [FormsModule, DatePipe, PanelShellComponent],
  template: `
    <app-panel-shell title="Expedientes">
      <p class="max-w-3xl text-sm text-muted-foreground">
        Trámites legales con su documentación y sus vencimientos. Es información confidencial: solo la ve la titular.
      </p>

      <div class="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <section>
          <form class="space-y-3 mer-card p-4" (submit)="create($event)">
            <p class="font-semibold text-forest-deep">Nuevo expediente</p>
            <input class="inp" name="title" placeholder="Ej.: Sucesión Aguirre" [(ngModel)]="draft.title" />
            <select class="inp" name="kind" [(ngModel)]="draft.kind">
              @for (k of kinds; track k.id) {
                <option [value]="k.id">{{ k.label }}</option>
              }
            </select>
            <select class="inp" name="contact" [(ngModel)]="draft.contactId">
              <option value="">Sin contacto vinculado</option>
              @for (c of contacts.all(); track c.id) {
                <option [value]="c.id">{{ c.name }}</option>
              }
            </select>
            @if (error(); as e) {
              <p class="text-sm text-red-700" role="alert">{{ e }}</p>
            }
            <button type="submit" class="h-11 w-full rounded-lg bg-forest-deep text-sm font-semibold text-stone-warm transition hover:bg-forest hover:text-white">
              Crear con la lista de documentos del trámite
            </button>
          </form>

          <ul class="mt-4 space-y-2">
            @for (c of sorted(); track c.id) {
              <li>
                <button
                  type="button"
                  class="w-full rounded-xl border bg-background p-3 text-left transition hover:border-forest"
                  [class]="selectedId() === c.id ? 'border-forest' : 'border-border'"
                  (click)="selectedId.set(c.id)"
                >
                  <span class="block font-medium text-forest-deep">{{ c.title }}</span>
                  <span class="block text-xs text-muted-foreground">
                    {{ kindLabels[c.kind] }} · {{ statusLabels[c.status] }}
                    @if (nextDeadline(c); as d) {
                      · <span [class]="d.days < 0 ? 'font-semibold text-red-700' : d.days <= 7 ? 'font-semibold text-forest-deep' : ''">
                        {{ d.label }}: {{ d.date | date: 'dd/MM' }}
                      </span>
                    }
                  </span>
                </button>
              </li>
            } @empty {
              <li class="rounded-xl border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
                No hay expedientes cargados.
              </li>
            }
          </ul>
        </section>

        <section>
          @if (selected(); as c) {
            <div class="mer-card p-5">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="min-w-0">
                  <h2 class="font-display text-xl font-medium text-forest-deep">{{ c.title }}</h2>
                  <p class="text-sm text-muted-foreground">
                    {{ kindLabels[c.kind] }} · abierto el {{ c.openedAt | date: 'dd/MM/yyyy' }}
                    @if (contactName(c); as n) { · {{ n }} }
                  </p>
                </div>
                <select
                  class="h-9 rounded-lg border border-border bg-background px-2 text-sm"
                  [ngModel]="c.status"
                  (ngModelChange)="cases.patch(c.id, { status: $event })"
                  aria-label="Estado del expediente"
                >
                  @for (s of statusOptions; track s.id) {
                    <option [value]="s.id">{{ s.label }}</option>
                  }
                </select>
              </div>

              <label class="mt-4 block">
                <span class="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">Carátula o número</span>
                <input
                  class="inp mt-1"
                  [value]="c.reference ?? ''"
                  (change)="cases.patch(c.id, { reference: $any($event.target).value.trim() || undefined })"
                />
              </label>

              <h3 class="mt-6 font-display text-lg font-medium text-forest-deep">Vencimientos</h3>
              <ul class="mt-2 space-y-2">
                @for (d of c.deadlines; track d.id) {
                  <li class="flex items-center gap-3 text-sm">
                    <input type="checkbox" [checked]="d.done" (change)="toggleDeadline(c, d.id)" [attr.aria-label]="'Hecho: ' + d.label" />
                    <span class="min-w-0 flex-1" [class.line-through]="d.done">{{ d.label }}</span>
                    <span
                      class="tabular-nums"
                      [class]="!d.done && days(d.date) < 0 ? 'font-semibold text-red-700' : 'text-muted-foreground'"
                    >
                      {{ d.date | date: 'dd/MM/yyyy' }}
                    </span>
                    <button type="button" class="text-red-700" (click)="removeDeadline(c, d.id)" aria-label="Quitar vencimiento">×</button>
                  </li>
                } @empty {
                  <li class="text-sm text-muted-foreground">Sin vencimientos.</li>
                }
              </ul>
              <div class="mt-3 flex flex-wrap gap-2">
                <input class="inp min-w-0 flex-1" placeholder="Ej.: Presentar escrito" [(ngModel)]="newDeadline.label" name="dl-label" />
                <input class="inp w-40" type="date" [(ngModel)]="newDeadline.date" name="dl-date" />
                <button type="button" class="h-11 rounded-lg border border-border px-4 text-sm font-medium transition hover:border-forest" (click)="addDeadline(c)">
                  Agregar
                </button>
              </div>

              <h3 class="mt-6 font-display text-lg font-medium text-forest-deep">
                Documentación ({{ doneCount(c) }} de {{ c.checklist.length }})
              </h3>
              <ul class="mt-2 space-y-1.5">
                @for (item of c.checklist; track item.id) {
                  <li class="flex items-center gap-3 text-sm">
                    <input type="checkbox" [checked]="item.done" (change)="toggleCheck(c, item.id)" [attr.aria-label]="item.label" />
                    <span class="min-w-0 flex-1" [class.line-through]="item.done">{{ item.label }}</span>
                    <button type="button" class="text-red-700" (click)="removeCheck(c, item.id)" aria-label="Quitar documento">×</button>
                  </li>
                }
              </ul>
              <div class="mt-3 flex gap-2">
                <input class="inp min-w-0 flex-1" placeholder="Agregar un documento…" [(ngModel)]="newCheck" name="check-label" />
                <button type="button" class="h-11 rounded-lg border border-border px-4 text-sm font-medium transition hover:border-forest" (click)="addCheck(c)">
                  Agregar
                </button>
              </div>

              <label class="mt-6 block">
                <span class="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">Notas</span>
                <textarea
                  class="mt-1 min-h-24 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-forest"
                  [value]="c.notes ?? ''"
                  (change)="cases.patch(c.id, { notes: $any($event.target).value.trim() || undefined })"
                ></textarea>
              </label>

              <button
                type="button"
                class="mt-6 h-9 rounded-lg border border-border px-3 text-sm text-red-700 transition hover:border-red-400"
                (click)="remove(c)"
              >
                Eliminar expediente
              </button>
            </div>
          } @else {
            <div class="rounded-xl border border-dashed border-border bg-background p-10 text-center text-muted-foreground">
              Elegí un expediente para ver su documentación y vencimientos.
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
        min-height: 2.75rem;
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
export class PanelCasesComponent {
  readonly cases = inject(CasesStore);
  readonly contacts = inject(ContactsStore);

  readonly kindLabels = CASE_KIND_LABELS;
  readonly statusLabels = STATUS_LABELS;
  readonly kinds = (Object.keys(CASE_KIND_LABELS) as CaseKind[]).map((id) => ({ id, label: CASE_KIND_LABELS[id] }));
  readonly statusOptions = (Object.keys(STATUS_LABELS) as (keyof typeof STATUS_LABELS)[]).map((id) => ({
    id,
    label: STATUS_LABELS[id],
  }));

  readonly selectedId = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  draft = { title: '', kind: 'sucesion' as CaseKind, contactId: '' };
  newDeadline = { label: '', date: '' };
  newCheck = '';

  readonly sorted = computed(() =>
    [...this.cases.all()].sort((a, b) => {
      const ra = a.status === 'cerrado' ? 1 : 0;
      const rb = b.status === 'cerrado' ? 1 : 0;
      return ra - rb || b.openedAt.localeCompare(a.openedAt);
    })
  );

  readonly selected = computed(() => {
    const id = this.selectedId();
    return id ? this.cases.get(id) ?? null : null;
  });

  days(date: string): number {
    return daysUntil(date);
  }

  /** El vencimiento pendiente más próximo (o el más atrasado). */
  nextDeadline(c: LegalCase): { label: string; date: string; days: number } | null {
    const pending = c.deadlines.filter((d) => !d.done).sort((a, b) => a.date.localeCompare(b.date))[0];
    return pending ? { label: pending.label, date: pending.date, days: daysUntil(pending.date) } : null;
  }

  contactName(c: LegalCase): string {
    return (c.contactId ? this.contacts.get(c.contactId)?.name : '') ?? '';
  }

  doneCount(c: LegalCase): number {
    return c.checklist.filter((i) => i.done).length;
  }

  create(event: Event) {
    event.preventDefault();
    if (!this.draft.title.trim()) {
      this.error.set('Ponele un título al expediente.');
      return;
    }
    this.error.set(null);
    const id = this.cases.newId('e');
    this.cases.save({
      id,
      title: this.draft.title.trim(),
      kind: this.draft.kind,
      contactId: this.draft.contactId || undefined,
      status: 'abierto',
      openedAt: new Date().toISOString(),
      deadlines: [],
      checklist: CASE_CHECKLISTS[this.draft.kind].map((label, i) => ({ id: `${id}-c${i}`, label, done: false })),
    });
    this.selectedId.set(id);
    this.draft = { title: '', kind: this.draft.kind, contactId: '' };
  }

  toggleCheck(c: LegalCase, itemId: string) {
    this.cases.patch(c.id, { checklist: c.checklist.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)) });
  }

  addCheck(c: LegalCase) {
    const label = this.newCheck.trim();
    if (!label) return;
    this.cases.patch(c.id, { checklist: [...c.checklist, { id: `${c.id}-c${Date.now().toString(36)}`, label, done: false }] });
    this.newCheck = '';
  }

  removeCheck(c: LegalCase, itemId: string) {
    this.cases.patch(c.id, { checklist: c.checklist.filter((i) => i.id !== itemId) });
  }

  toggleDeadline(c: LegalCase, id: string) {
    this.cases.patch(c.id, { deadlines: c.deadlines.map((d) => (d.id === id ? { ...d, done: !d.done } : d)) });
  }

  addDeadline(c: LegalCase) {
    const { label, date } = this.newDeadline;
    if (!label.trim() || !date) return;
    this.cases.patch(c.id, {
      deadlines: [...c.deadlines, { id: `${c.id}-d${Date.now().toString(36)}`, label: label.trim(), date, done: false }],
    });
    this.newDeadline = { label: '', date: '' };
  }

  removeDeadline(c: LegalCase, id: string) {
    this.cases.patch(c.id, { deadlines: c.deadlines.filter((d) => d.id !== id) });
  }

  remove(c: LegalCase) {
    if (!confirm(`¿Eliminar el expediente «${c.title}»? No se puede deshacer.`)) return;
    this.cases.remove(c.id);
    this.selectedId.set(null);
  }
}
