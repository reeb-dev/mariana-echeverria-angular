import { ToastService } from '../../data/toast.service';
import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ActivityLog } from '../../data/activity-log';
import { AuthService } from '../../data/auth.service';
import { AppraisalsStore } from '../../data/appraisals-store';
import { daysUntil, localIsoDate, nextAdjustment } from '../../data/calculators';
import { CasesStore, LeasesStore, RemindersStore, VisitsStore } from '../../data/crm-stores';
import { INQUIRY_STATUS_LABELS, InquiriesStore } from '../../data/inquiries-store';
import { listingQuality } from '../../data/listing-quality';
import { PropertyStore } from '../../data/property-store';
import { STATUS_LABELS, type PropertyStatus } from '../../data/properties';
import { PanelShellComponent } from './panel-shell.component';

@Component({
  selector: 'app-panel-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule, PanelShellComponent],
  template: `
    <app-panel-shell [title]="greeting()">
      <!-- Indicadores -->
      <dl class="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
        @for (card of cards(); track card.label) {
          <a [routerLink]="card.link" class="mer-stat" [class.mer-card-alert]="card.urgent">
            <span class="mer-stat-icon" [class]="card.tone">
              <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path [attr.d]="card.icon" />
              </svg>
            </span>
            <span class="min-w-0">
              <dt class="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">{{ card.label }}</dt>
              <dd class="mt-1 font-display text-3xl font-medium sm:text-4xl leading-none text-forest-deep tabular-nums">{{ card.value }}</dd>
              <p class="mt-1.5 text-sm" [class]="card.urgent ? 'font-medium text-red-700' : 'text-muted-foreground'">{{ card.hint }}</p>
            </span>
          </a>
        }
      </dl>

      <!-- Accesos rápidos -->
      <div class="mt-6 flex flex-wrap gap-3">
        @if (auth.can('propiedades.crear')) {
          <a
            routerLink="/panel/propiedad/nueva"
            class="inline-flex h-11 items-center rounded-lg bg-forest-deep px-5 text-sm font-semibold text-stone-warm transition hover:bg-forest hover:text-white"
          >
            + Nueva propiedad
          </a>
        }
        <a
          routerLink="/panel/consultas"
          class="inline-flex h-11 items-center rounded-lg border border-border bg-background px-5 text-sm font-medium transition hover:border-forest"
        >
          Ver consultas
        </a>
        <a
          routerLink="/"
          class="inline-flex h-11 items-center rounded-lg border border-border bg-background px-5 text-sm font-medium transition hover:border-forest"
        >
          Ver el sitio
        </a>
      </div>

      <div class="mt-8 grid gap-6 lg:grid-cols-2">
        <!-- Recordatorios -->
        <section class="mer-card mer-card-accent p-5 lg:col-span-2" aria-label="Recordatorios">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="font-display text-lg font-medium text-forest-deep">Recordatorios</h2>
            <p class="text-xs text-muted-foreground">{{ pendingReminders().length }} pendientes</p>
          </div>
          <form class="mt-4 flex flex-wrap gap-2" (submit)="addReminder($event)">
            <input
              class="h-11 min-w-0 flex-1 rounded-lg border border-border bg-background px-3.5 text-sm outline-none focus:border-forest"
              name="reminder-text"
              placeholder="Ej.: llamar a la familia Rossi por la tasación"
              [(ngModel)]="newReminder.text"
              aria-label="Texto del recordatorio"
            />
            <input
              class="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-forest"
              type="date"
              name="reminder-due"
              [(ngModel)]="newReminder.due"
              aria-label="Fecha"
            />
            <button
              type="submit"
              class="h-11 rounded-lg bg-forest-deep px-5 text-sm font-semibold text-stone-warm transition hover:bg-forest hover:text-white"
            >
              Agregar
            </button>
          </form>
          <ul class="mt-4 divide-y divide-border/70">
            @for (r of pendingReminders(); track r.id) {
              <li class="flex items-center gap-3 py-2.5 text-sm">
                <input
                  type="checkbox"
                  class="h-4 w-4"
                  [checked]="r.done"
                  (change)="reminders.patch(r.id, { done: true })"
                  [attr.aria-label]="'Hecho: ' + r.text"
                />
                <span class="min-w-0 flex-1">
                  <span class="block">{{ r.text }}</span>
                  @if (r.context) {
                    <span class="text-xs text-muted-foreground">{{ r.context }}</span>
                  }
                </span>
                <span
                  class="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  [class]="days(r.due) < 0 ? 'bg-red-100 text-red-800' : days(r.due) === 0 ? 'bg-stone-warm/40 text-forest-deep' : 'bg-muted text-muted-foreground'"
                >
                  {{ days(r.due) < 0 ? 'vencido' : days(r.due) === 0 ? 'hoy' : (r.due | date: 'dd/MM') }}
                </span>
                <button
                  type="button"
                  class="shrink-0 text-red-700"
                  (click)="reminders.remove(r.id); toast.success('Recordatorio quitado.')"
                  aria-label="Quitar recordatorio"
                >
                  ×
                </button>
              </li>
            } @empty {
              <li class="py-3 text-sm text-muted-foreground">No tenés recordatorios pendientes.</li>
            }
          </ul>
        </section>

        <!-- Consultas nuevas -->
        <section class="mer-card p-5">
          <div class="flex items-center justify-between">
            <h2 class="font-display text-lg font-medium text-forest-deep">Consultas para atender</h2>
            <a routerLink="/panel/consultas" class="text-sm text-forest underline underline-offset-2">Ver todas</a>
          </div>
          <ul class="mt-4 divide-y divide-border/70">
            @for (q of pendingInquiries(); track q.id) {
              <li class="py-3">
                <p class="text-sm font-medium text-forest-deep">{{ q.name }}</p>
                <p class="text-xs text-muted-foreground">
                  {{ q.at | date: 'dd/MM HH:mm' }} · {{ inquiryLabels[q.status] }}
                </p>
                @if (q.message) {
                  <p class="mt-1 line-clamp-2 text-sm text-muted-foreground">{{ q.message }}</p>
                }
              </li>
            } @empty {
              <li class="py-4 text-sm text-muted-foreground">No hay consultas nuevas. ¡Todo al día!</li>
            }
          </ul>
        </section>

        <!-- Estado del inventario -->
        <section class="mer-card p-5">
          <h2 class="font-display text-lg font-medium text-forest-deep">Propiedades por estado</h2>
          <ul class="mt-4 space-y-3">
            @for (row of byStatus(); track row.id) {
              <li>
                <div class="flex justify-between text-sm">
                  <span>{{ row.label }}</span>
                  <span class="font-semibold tabular-nums">{{ row.count }}</span>
                </div>
                <div class="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                  <div class="h-full rounded-full bg-forest" [style.width.%]="row.percent"></div>
                </div>
              </li>
            }
          </ul>
        </section>

        <!-- Agenda y vencimientos -->
        @if (auth.can('contactos.gestionar')) {
          <section class="mer-card p-5">
            <div class="flex items-center justify-between">
              <h2 class="font-display text-lg font-medium text-forest-deep">Próximas visitas</h2>
              <a routerLink="/panel/visitas" class="text-sm text-forest underline underline-offset-2">Agenda</a>
            </div>
            <ul class="mt-4 divide-y divide-border/70">
              @for (v of upcomingVisits(); track v.id) {
                <li class="py-2.5 text-sm">
                  <span class="block font-medium text-forest-deep">{{ v.title }}</span>
                  <span class="text-xs text-muted-foreground">{{ v.at | date: "EEEE dd/MM 'a las' HH:mm" }} · {{ v.who }}</span>
                </li>
              } @empty {
                <li class="py-3 text-sm text-muted-foreground">No hay visitas agendadas.</li>
              }
            </ul>
          </section>
        }

        @if (auth.can('contratos.gestionar') || auth.can('expedientes.gestionar')) {
          <section class="mer-card p-5">
            <h2 class="font-display text-lg font-medium text-forest-deep">Vencimientos</h2>
            <ul class="mt-4 divide-y divide-border/70">
              @for (d of deadlines(); track d.key) {
                <li class="flex items-start justify-between gap-3 py-2.5 text-sm">
                  <span class="min-w-0">
                    <span class="block truncate font-medium text-forest-deep">{{ d.label }}</span>
                    <span class="text-xs text-muted-foreground">{{ d.kind }}</span>
                  </span>
                  <span class="shrink-0 text-right text-xs" [class]="d.days < 0 ? 'font-semibold text-red-700' : 'text-muted-foreground'">
                    {{ d.days < 0 ? 'hace ' + -d.days + ' días' : d.days === 0 ? 'hoy' : 'en ' + d.days + ' días' }}
                  </span>
                </li>
              } @empty {
                <li class="py-3 text-sm text-muted-foreground">No hay vencimientos próximos.</li>
              }
            </ul>
          </section>
        }

        <!-- Avisos a mejorar -->
        <section class="mer-card p-5 lg:col-span-2">
          <div class="flex items-center justify-between">
            <h2 class="font-display text-lg font-medium text-forest-deep">Avisos para mejorar</h2>
            <a routerLink="/panel/estadisticas" class="text-sm text-forest underline underline-offset-2">Ver estadísticas</a>
          </div>
          <ul class="mt-4 divide-y divide-border/70">
            @for (item of toImprove(); track item.property.id) {
              <li class="flex flex-wrap items-center justify-between gap-3 py-2.5 text-sm">
                <span class="min-w-0 flex-1">
                  <span class="block truncate font-medium text-forest-deep">{{ item.property.title }}</span>
                  <span class="block text-xs text-muted-foreground">{{ item.tip }}</span>
                </span>
                <span class="font-semibold tabular-nums">{{ item.score }}/100</span>
                <a [routerLink]="['/panel/propiedad', item.property.id]" class="text-forest underline underline-offset-2">
                  Mejorar
                </a>
              </li>
            } @empty {
              <li class="py-3 text-sm text-muted-foreground">Todos los avisos publicados están en buen nivel.</li>
            }
          </ul>
        </section>

        <!-- Mis propiedades (agente) o actividad (titular) -->
        @if (auth.can('usuarios.gestionar')) {
          <section class="mer-card p-5 lg:col-span-2">
            <h2 class="font-display text-lg font-medium text-forest-deep">Actividad reciente</h2>
            <ul class="mt-4 divide-y divide-border/70">
              @for (entry of activity.entries().slice(0, 6); track entry.at + entry.action) {
                <li class="flex flex-wrap gap-x-3 gap-y-1 py-2.5 text-sm">
                  <span class="tabular-nums text-muted-foreground">{{ entry.at | date: 'dd/MM HH:mm' }}</span>
                  <span class="font-medium text-forest-deep">{{ entry.user }}</span>
                  <span>{{ entry.action }}</span>
                </li>
              } @empty {
                <li class="py-3 text-sm text-muted-foreground">Todavía no hay movimientos registrados.</li>
              }
            </ul>
          </section>
        } @else {
          <section class="mer-card p-5 lg:col-span-2">
            <h2 class="font-display text-lg font-medium text-forest-deep">Mis propiedades</h2>
            <ul class="mt-4 divide-y divide-border/70">
              @for (p of mine(); track p.id) {
                <li class="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span class="min-w-0 truncate">{{ p.title }}</span>
                  <a [routerLink]="['/panel/propiedad', p.id]" class="shrink-0 text-forest underline underline-offset-2">Editar</a>
                </li>
              } @empty {
                <li class="py-3 text-sm text-muted-foreground">Todavía no tenés propiedades a tu cargo.</li>
              }
            </ul>
          </section>
        }
      </div>
    </app-panel-shell>
  `,
})
export class PanelDashboardComponent {
  protected readonly toast = inject(ToastService);
  readonly auth = inject(AuthService);
  private readonly properties = inject(PropertyStore);
  private readonly inquiries = inject(InquiriesStore);
  private readonly appraisals = inject(AppraisalsStore);
  private readonly visits = inject(VisitsStore);
  private readonly leases = inject(LeasesStore);
  private readonly cases = inject(CasesStore);
  readonly reminders = inject(RemindersStore);
  readonly activity = inject(ActivityLog);
  readonly inquiryLabels = INQUIRY_STATUS_LABELS;

  readonly greeting = computed(() => {
    const name = this.auth.user()?.name.split(' ')[0];
    return name ? `Hola, ${name}` : 'Resumen';
  });

  readonly cards = computed(() => {
    const all = this.properties.all();
    const published = this.properties.published().length;
    const closed = all.filter((p) => ['vendida', 'alquilada'].includes(this.properties.statusOf(p))).length;
    const toConfirm = this.visits.all().filter((v) => v.status === 'solicitada').length;
    const inquiriesNew = this.inquiries.newCount();
    const appraisalsNew = this.appraisals.newCount();
    const iconHome = 'M3 11l9-8 9 8 M5 10v10h14V10 M10 20v-6h4v6';
    return [
      {
        label: 'Consultas nuevas',
        value: inquiriesNew,
        hint: inquiriesNew > 0 ? 'Respondé hoy para no perder al cliente' : 'Todo al día',
        link: '/panel/consultas',
        icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
        tone: inquiriesNew > 0 ? 'tone-alert' : 'tone-forest',
        urgent: inquiriesNew > 0,
      },
      {
        label: 'Tasaciones nuevas',
        value: appraisalsNew,
        hint: appraisalsNew > 0 ? 'Prometimos entregarlas en el día' : 'Sin pedidos pendientes',
        link: '/panel/tasaciones',
        icon: 'M9 11l3 3 8-8 M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h9',
        tone: appraisalsNew > 0 ? 'tone-alert' : 'tone-gold',
        urgent: appraisalsNew > 0,
      },
      {
        label: 'Visitas por confirmar',
        value: toConfirm,
        hint: toConfirm > 0 ? 'Pidieron una visita desde el sitio' : 'Sin pedidos de visita',
        link: '/panel/visitas',
        icon: 'M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
        tone: toConfirm > 0 ? 'tone-alert' : 'tone-ink',
        urgent: toConfirm > 0,
      },
      {
        label: 'Publicadas',
        value: published,
        hint: `de ${all.length} cargadas`,
        link: '/panel/propiedades',
        icon: iconHome,
        tone: 'tone-forest',
        urgent: false,
      },
      {
        label: 'Destacadas',
        value: this.properties.featured().length,
        hint: 'visibles en la home',
        link: '/panel/destacadas',
        icon: 'M12 2l3 7 7 .6-5.3 4.7 1.6 7.2L12 17.8 5.7 21.5l1.6-7.2L2 9.6 9 9z',
        tone: 'tone-gold',
        urgent: false,
      },
      {
        label: 'Vendidas / alquiladas',
        value: closed,
        hint: 'operaciones cerradas',
        link: '/panel/propiedades',
        icon: 'M20 6L9 17l-5-5',
        tone: 'tone-ink',
        urgent: false,
      },
    ];
  });

  /** Recordatorios sin hacer, primero los más urgentes. */
  readonly pendingReminders = computed(() =>
    this.reminders
      .all()
      .filter((r) => !r.done)
      .sort((a, b) => a.due.localeCompare(b.due))
      .slice(0, 8)
  );

  newReminder = { text: '', due: localIsoDate() };

  days(date: string): number {
    return daysUntil(date);
  }

  addReminder(event: Event) {
    event.preventDefault();
    const text = this.newReminder.text.trim();
    if (!text || !this.newReminder.due) return;
    this.reminders.save({
      id: this.reminders.newId('t'),
      text,
      due: this.newReminder.due,
      done: false,
      userId: this.auth.user()?.id,
      createdAt: new Date().toISOString(),
    });
    this.newReminder.text = '';
    this.toast.success('Recordatorio guardado.');
  }


  /** Próximas visitas agendadas. */
  readonly upcomingVisits = computed(() =>
    this.visits
      .all()
      .filter((v) => v.status === 'programada' && new Date(v.at).getTime() >= Date.now() - 3_600_000)
      .sort((a, b) => a.at.localeCompare(b.at))
      .slice(0, 4)
      .map((v) => ({
        id: v.id,
        at: v.at,
        title: this.properties.getBySlug(v.propertySlug)?.title ?? v.propertySlug,
        who: v.visitorName ?? 'Contacto',
      }))
  );

  /** Fines de contrato, ajustes y vencimientos de expedientes de los próximos 30 días (o ya vencidos). */
  readonly deadlines = computed(() => {
    const out: { key: string; label: string; kind: string; days: number }[] = [];
    if (this.auth.can('contratos.gestionar')) {
      for (const l of this.leases.all().filter((x) => x.status === 'vigente')) {
        const end = daysUntil(l.endDate);
        if (end <= 60) out.push({ key: `end-${l.id}`, label: `${l.propertyLabel}: fin del contrato`, kind: 'Contrato', days: end });
        const adj = nextAdjustment(l.startDate, l.adjustEveryMonths, l.endDate);
        if (adj && daysUntil(adj) <= 30) {
          out.push({ key: `adj-${l.id}`, label: `${l.propertyLabel}: ajuste del alquiler`, kind: 'Contrato', days: daysUntil(adj) });
        }
      }
    }
    if (this.auth.can('expedientes.gestionar')) {
      for (const c of this.cases.all().filter((x) => x.status !== 'cerrado')) {
        for (const d of c.deadlines.filter((x) => !x.done)) {
          const days = daysUntil(d.date);
          if (days <= 30) out.push({ key: `case-${d.id}`, label: `${c.title}: ${d.label}`, kind: 'Expediente', days });
        }
      }
    }
    return out.sort((a, b) => a.days - b.days).slice(0, 6);
  });

  /** Publicadas con calidad baja, de menor a mayor, con lo más importante que les falta. */
  readonly toImprove = computed(() =>
    this.properties
      .published()
      .map((property) => {
        const quality = listingQuality(property);
        const worst = [...quality.checks]
          .filter((c) => c.points < c.max)
          .sort((a, b) => b.max - b.points - (a.max - a.points))[0];
        return { property, score: quality.score, tip: worst?.hint ?? '' };
      })
      .filter((item) => item.score < 80)
      .sort((a, b) => a.score - b.score)
      .slice(0, 4)
  );

  readonly pendingInquiries = computed(() =>
    this.inquiries
      .all()
      .filter((q) => q.status === 'nueva')
      .slice(0, 5)
  );

  readonly byStatus = computed(() => {
    const all = this.properties.all();
    const total = Math.max(1, all.length);
    return (Object.keys(STATUS_LABELS) as PropertyStatus[]).map((id) => {
      const count = all.filter((p) => this.properties.statusOf(p) === id).length;
      return { id, label: STATUS_LABELS[id], count, percent: Math.round((count / total) * 100) };
    });
  });

  readonly mine = computed(() => {
    const id = this.auth.user()?.id;
    return this.properties.all().filter((p) => p.agentId === id);
  });
}
