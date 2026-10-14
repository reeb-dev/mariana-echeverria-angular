import { ConfirmService } from '../../data/confirm.service';
import { ToastService } from '../../data/toast.service';
import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { daysUntil, localIsoDate, nextAdjustment } from '../../data/calculators';
import { ContactsStore, LeasesStore, type Lease, type LeaseKind } from '../../data/crm-stores';
import { PropertyStore } from '../../data/property-store';
import { PanelShellComponent } from './panel-shell.component';

type Row = {
  lease: Lease;
  daysToEnd: number;
  nextAdjust: string | null;
  daysToAdjust: number | null;
  alert: 'vencido' | 'vence' | 'ajuste' | null;
};

const ALERT_END_DAYS = 60;
const ALERT_ADJUST_DAYS = 30;

@Component({
  selector: 'app-panel-leases',
  standalone: true,
  imports: [FormsModule, DatePipe, PanelShellComponent],
  template: `
    <app-panel-shell title="Contratos">
      <p class="max-w-3xl text-sm text-muted-foreground">
        Alquileres y arrendamientos vigentes, con aviso cuando se acerca el vencimiento (a {{ endDays }} días) o el próximo ajuste
        (a {{ adjustDays }} días).
      </p>

      <div class="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar contratos">
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
        <button
          type="button"
          class="ml-auto h-11 rounded-lg bg-forest-deep px-5 text-sm font-semibold text-stone-warm transition hover:bg-forest hover:text-white"
          (click)="startNew()"
        >
          + Nuevo contrato
        </button>
      </div>

      @if (editing(); as e) {
        <form class="mt-6 grid gap-4 mer-card p-5 md:grid-cols-3" (submit)="save($event)">
          <h2 class="font-display text-lg font-medium text-forest-deep md:col-span-3">
            {{ isNew() ? 'Nuevo contrato' : 'Editar contrato' }}
          </h2>
          <label>
            <span class="lbl">Tipo</span>
            <select class="inp" name="kind" [(ngModel)]="e.kind">
              <option value="urbano">Locación urbana</option>
              <option value="rural">Arrendamiento rural</option>
            </select>
          </label>
          <label class="md:col-span-2">
            <span class="lbl">Inmueble o campo *</span>
            <input class="inp" name="label" [(ngModel)]="e.propertyLabel" placeholder="Departamento en Rivas 200" />
          </label>
          <label>
            <span class="lbl">Propiedad del sitio (opcional)</span>
            <select class="inp" name="slug" [(ngModel)]="e.propertySlug">
              <option [ngValue]="undefined">Ninguna</option>
              @for (p of properties.all(); track p.id) {
                <option [value]="p.slug">{{ p.title }}</option>
              }
            </select>
          </label>
          <label>
            <span class="lbl">Propietario *</span>
            <input class="inp" name="owner" [(ngModel)]="e.ownerName" />
          </label>
          <label>
            <span class="lbl">Inquilino o arrendatario *</span>
            <input class="inp" name="tenant" [(ngModel)]="e.tenantName" list="tenant-list" />
            <datalist id="tenant-list">
              @for (c of contacts.all(); track c.id) {
                <option [value]="c.name"></option>
              }
            </datalist>
          </label>
          <label>
            <span class="lbl">Garante</span>
            <input class="inp" name="guarantor" [(ngModel)]="e.guarantor" />
          </label>
          <label>
            <span class="lbl">Inicio *</span>
            <input class="inp" type="date" name="start" [(ngModel)]="e.startDate" />
          </label>
          <label>
            <span class="lbl">Vencimiento *</span>
            <input class="inp" type="date" name="end" [(ngModel)]="e.endDate" />
          </label>
          <label>
            <span class="lbl">Se ajusta cada (meses)</span>
            <input class="inp" type="number" min="0" name="adjust" [(ngModel)]="e.adjustEveryMonths" placeholder="0 = no se ajusta" />
          </label>
          <label>
            <span class="lbl">Monto *</span>
            <input class="inp" type="number" min="0" name="rent" [(ngModel)]="e.rent" />
          </label>
          <label>
            <span class="lbl">Moneda</span>
            <select class="inp" name="currency" [(ngModel)]="e.currency">
              <option value="ARS">Pesos</option>
              <option value="USD">USD</option>
              <option value="QUINTALES">Quintales (rural)</option>
            </select>
          </label>
          <label>
            <span class="lbl">Depósito</span>
            <input class="inp" type="number" min="0" name="deposit" [(ngModel)]="e.deposit" />
          </label>
          <label class="md:col-span-3">
            <span class="lbl">Regla de ajuste</span>
            <input class="inp" name="rule" [(ngModel)]="e.adjustmentRule" placeholder="Según el índice pactado en el contrato" />
          </label>
          <label class="md:col-span-3">
            <span class="lbl">Notas</span>
            <textarea class="inp min-h-20 py-2" name="notes" [(ngModel)]="e.notes"></textarea>
          </label>
          @if (error(); as msg) {
            <p class="text-sm text-red-700 md:col-span-3" role="alert">{{ msg }}</p>
          }
          <div class="flex gap-3 md:col-span-3">
            <button type="submit" class="h-11 rounded-lg bg-forest-deep px-6 text-sm font-semibold text-stone-warm transition hover:bg-forest hover:text-white">
              Guardar
            </button>
            <button type="button" class="h-11 rounded-lg border border-border px-6 text-sm font-medium transition hover:border-forest" (click)="editing.set(null)">
              Cancelar
            </button>
          </div>
        </form>
      }

      <ul class="mt-6 space-y-3">
        @for (row of filteredRows(); track row.lease.id) {
          <li
            class="rounded-xl border bg-background p-4"
            [class]="row.alert === 'vencido' ? 'border-red-300' : row.alert ? 'border-stone-warm' : 'border-border'"
          >
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="font-medium text-forest-deep">{{ row.lease.propertyLabel }}</p>
                <p class="text-sm text-muted-foreground">
                  {{ row.lease.kind === 'rural' ? 'Arrendamiento rural' : 'Locación urbana' }} · {{ row.lease.tenantName }}
                </p>
              </div>
              <p class="text-right text-sm font-semibold tabular-nums text-forest-deep">
                {{ amount(row.lease) }}
              </p>
            </div>
            <p class="mt-2 text-sm">
              {{ row.lease.startDate | date: 'dd/MM/yyyy' }} → {{ row.lease.endDate | date: 'dd/MM/yyyy' }}
              @if (row.lease.status === 'vigente') {
                ·
                @if (row.daysToEnd < 0) {
                  <strong class="text-red-700">venció hace {{ -row.daysToEnd }} días</strong>
                } @else {
                  vence en {{ row.daysToEnd }} días
                }
              }
            </p>
            @if (row.nextAdjust && row.lease.status === 'vigente') {
              <p class="text-sm" [class]="row.alert === 'ajuste' ? 'font-semibold text-forest-deep' : 'text-muted-foreground'">
                Próximo ajuste: {{ row.nextAdjust | date: 'dd/MM/yyyy' }} (en {{ row.daysToAdjust }} días)
                @if (row.lease.adjustmentRule) { · {{ row.lease.adjustmentRule }} }
              </p>
            }
            @if (row.alert === 'vence') {
              <p class="mt-2 rounded-lg bg-stone-warm/20 px-3 py-1.5 text-sm text-forest-deep">
                Se acerca el vencimiento: conviene hablar con el propietario y el inquilino sobre la renovación.
              </p>
            }
            <div class="mt-3 flex flex-wrap gap-2 border-t border-border/60 pt-3">
              <button type="button" class="h-9 rounded-lg border border-border px-3 text-sm transition hover:border-forest" (click)="edit(row.lease)">Editar</button>
              <button
                type="button"
                class="h-9 rounded-lg border border-border px-3 text-sm transition hover:border-forest"
                (click)="leases.patch(row.lease.id, { status: row.lease.status === 'vigente' ? 'finalizado' : 'vigente' })"
              >
                {{ row.lease.status === 'vigente' ? 'Marcar como finalizado' : 'Reactivar' }}
              </button>
              <button type="button" class="ml-auto h-9 rounded-lg border border-border px-3 text-sm text-red-700 transition hover:border-red-400" (click)="remove(row.lease)">
                Eliminar
              </button>
            </div>
          </li>
        } @empty {
          <li class="rounded-xl border border-dashed border-border bg-background p-8 text-center text-muted-foreground">
            No hay contratos en esta vista.
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
export class PanelLeasesComponent {
  protected readonly dialog = inject(ConfirmService);
  protected readonly toast = inject(ToastService);
  readonly leases = inject(LeasesStore);
  readonly contacts = inject(ContactsStore);
  readonly properties = inject(PropertyStore);

  readonly endDays = ALERT_END_DAYS;
  readonly adjustDays = ALERT_ADJUST_DAYS;
  readonly filters = [
    { id: 'todos', label: 'Todos' },
    { id: 'atencion', label: 'Requieren atención' },
    { id: 'vigente', label: 'Vigentes' },
    { id: 'finalizado', label: 'Finalizados' },
  ] as const;
  readonly filter = signal<'todos' | 'atencion' | 'vigente' | 'finalizado'>('todos');
  readonly editing = signal<Lease | null>(null);
  readonly isNew = signal(false);
  readonly error = signal<string | null>(null);

  readonly rows = computed<Row[]>(() =>
    this.leases
      .all()
      .map((lease) => {
        const daysToEnd = daysUntil(lease.endDate);
        const nextAdjust = nextAdjustment(lease.startDate, lease.adjustEveryMonths, lease.endDate);
        const daysToAdjust = nextAdjust ? daysUntil(nextAdjust) : null;
        let alert: Row['alert'] = null;
        if (lease.status === 'vigente') {
          if (daysToEnd < 0) alert = 'vencido';
          else if (daysToEnd <= ALERT_END_DAYS) alert = 'vence';
          else if (daysToAdjust !== null && daysToAdjust <= ALERT_ADJUST_DAYS) alert = 'ajuste';
        }
        return { lease, daysToEnd, nextAdjust, daysToAdjust, alert };
      })
      .sort((a, b) => a.lease.endDate.localeCompare(b.lease.endDate))
  );

  readonly filteredRows = computed(() =>
    this.rows().filter((r) => {
      const f = this.filter();
      if (f === 'todos') return true;
      if (f === 'atencion') return r.alert !== null;
      return r.lease.status === f;
    })
  );

  amount(l: Lease): string {
    const n = l.rent.toLocaleString('es-AR');
    if (l.currency === 'USD') return `USD ${n}`;
    if (l.currency === 'QUINTALES') return `${n} qq`;
    return `$ ${n}`;
  }

  startNew() {
    this.isNew.set(true);
    this.error.set(null);
    const today = localIsoDate();
    this.editing.set({
      id: this.leases.newId('l'),
      kind: 'urbano' as LeaseKind,
      propertyLabel: '',
      ownerName: '',
      tenantName: '',
      startDate: today,
      endDate: '',
      rent: 0,
      currency: 'ARS',
      adjustEveryMonths: 0,
      status: 'vigente',
    });
  }

  edit(lease: Lease) {
    this.isNew.set(false);
    this.error.set(null);
    this.editing.set({ ...lease });
  }

  save(event: Event) {
    event.preventDefault();
    const e = this.editing();
    if (!e) return;
    if (!e.propertyLabel.trim() || !e.ownerName.trim() || !e.tenantName.trim()) {
      this.error.set('Completá el inmueble, el propietario y el inquilino.');
      this.toast.error('Completá el inmueble, el propietario y el inquilino.');
      return;
    }
    if (!e.startDate || !e.endDate || e.endDate <= e.startDate) {
      this.error.set('El vencimiento tiene que ser posterior al inicio.');
      this.toast.error('El vencimiento tiene que ser posterior al inicio.');
      return;
    }
    if (!(e.rent > 0)) {
      this.error.set('Cargá el monto del alquiler o canon.');
      this.toast.error('Cargá el monto del alquiler o canon.');
      return;
    }
    const tenant = this.contacts.all().find((c) => c.name.toLowerCase() === e.tenantName.trim().toLowerCase());
    this.leases.save({
      ...e,
      propertyLabel: e.propertyLabel.trim(),
      ownerName: e.ownerName.trim(),
      tenantName: e.tenantName.trim(),
      tenantContactId: tenant?.id,
      adjustEveryMonths: Number(e.adjustEveryMonths) || 0,
      rent: Number(e.rent),
      deposit: e.deposit != null ? Number(e.deposit) || undefined : undefined,
    });
    this.editing.set(null);
    this.toast.success(this.isNew() ? 'Contrato creado.' : 'Contrato actualizado.');
  }

  async remove(lease: Lease) {
    if (!(await this.dialog.confirm({ title: `¿Eliminar el contrato de ${lease.tenantName}?`, confirmLabel: 'Eliminar', danger: true }))) return;
    this.leases.remove(lease.id);
    this.toast.success('Contrato eliminado.');
  }
}
