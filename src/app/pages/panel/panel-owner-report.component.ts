import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContactsStore, VisitsStore } from '../../data/crm-stores';
import { InquiriesStore } from '../../data/inquiries-store';
import { listingQuality } from '../../data/listing-quality';
import { PropertyStore } from '../../data/property-store';
import { CONTACT, STATUS_LABELS } from '../../data/properties';
import { StatsStore } from '../../data/stats-store';

/** Informe imprimible para el propietario: cómo viene el aviso de su propiedad. */
@Component({
  selector: 'app-panel-owner-report',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule],
  template: `
    <div class="min-h-screen bg-mist/60 px-4 py-6 print:bg-white print:p-0">
      <div class="mx-auto mb-6 flex max-w-[210mm] flex-wrap items-center justify-between gap-3 print:hidden">
        <a routerLink="/panel/propiedades" class="text-sm text-muted-foreground transition hover:text-forest">
          ← Volver al panel
        </a>
        <button
          type="button"
          class="h-11 rounded-lg bg-forest-deep px-5 text-sm font-semibold text-stone-warm transition hover:bg-forest hover:text-white"
          (click)="print()"
        >
          Imprimir o guardar como PDF
        </button>
      </div>

      @if (report(); as r) {
        <article class="mx-auto max-w-[210mm] bg-white px-[16mm] py-[14mm] shadow-brand print:shadow-none">
          <header class="flex items-start justify-between gap-4 border-b border-border pb-5">
            <div>
              <p class="font-display text-2xl text-forest-deep">{{ contact.brand }}</p>
              <p class="text-xs tracking-[0.2em] text-forest uppercase">{{ contact.tagline }} · {{ contact.matricula }}</p>
            </div>
            <p class="text-right text-sm text-muted-foreground">
              Informe del aviso<br />{{ today | date: 'dd/MM/yyyy' }}
            </p>
          </header>

          <section class="mt-6">
            @if (r.property.ownerName) {
              <p class="text-sm text-muted-foreground">Para: {{ r.property.ownerName }}</p>
            }
            <h1 class="mt-1 font-display text-2xl text-forest-deep">{{ r.property.title }}</h1>
            <p class="text-muted-foreground">{{ r.property.location }} · {{ r.property.priceLabel }}</p>
            <p class="mt-1 text-sm">
              Estado: <strong>{{ statusLabels[r.status] }}</strong> · {{ r.property.photos.length }} fotos
            </p>
          </section>

          <section class="mt-8">
            <h2 class="font-display text-lg font-medium text-forest-deep">Cómo viene el aviso</h2>
            <dl class="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
              @for (m of r.metrics; track m.label) {
                <div class="rounded-lg border border-border p-4">
                  <dt class="text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">{{ m.label }}</dt>
                  <dd class="mt-1 text-3xl font-semibold tabular-nums text-forest-deep">{{ m.value }}</dd>
                </div>
              }
            </dl>
          </section>

          @if (r.feedbacks.length > 0) {
            <section class="mt-8">
              <h2 class="font-display text-lg font-medium text-forest-deep">Devoluciones de las visitas</h2>
              <ul class="mt-3 space-y-3 text-sm">
                @for (f of r.feedbacks; track f.at + f.who) {
                  <li class="rounded-lg border border-border p-3">
                    <p class="font-medium">
                      {{ f.who }}
                      @if (f.interest) { <span class="font-normal text-muted-foreground"> · interés {{ f.interest }} de 5</span> }
                    </p>
                    <p class="mt-1 text-muted-foreground">{{ f.text }}</p>
                  </li>
                }
              </ul>
            </section>
          }

          <section class="mt-8">
            <h2 class="font-display text-lg font-medium text-forest-deep">Calidad del aviso: {{ r.quality.score }}/100</h2>
            <ul class="mt-3 space-y-1.5 text-sm">
              @for (c of r.quality.checks; track c.id) {
                <li class="flex gap-2">
                  <span [class]="c.points === c.max ? 'text-green-700' : 'text-muted-foreground'">
                    {{ c.points === c.max ? '✓' : '○' }}
                  </span>
                  <span>
                    {{ c.label }} ({{ c.points }}/{{ c.max }})
                    @if (c.hint) {
                      <span class="text-muted-foreground"> — {{ c.hint }}</span>
                    }
                  </span>
                </li>
              }
            </ul>
          </section>

          <section class="mt-8">
            <h2 class="font-display text-lg font-medium text-forest-deep">Comentarios</h2>
            <textarea
              class="mt-3 min-h-32 w-full rounded-lg border border-border p-3 text-sm outline-none focus:border-forest print:hidden"
              placeholder="Escribí acá lo que quieras contarle al propietario: devoluciones de las visitas, sugerencias de precio, próximos pasos…"
              [(ngModel)]="comments"
            ></textarea>
            <p class="mt-3 hidden whitespace-pre-line text-sm leading-relaxed print:block">{{ comments || 'Sin comentarios.' }}</p>
          </section>

          <footer class="mt-10 border-t border-border pt-4 text-xs text-muted-foreground">
            Las cifras corresponden a la actividad registrada en el sitio {{ contact.brand }} y se actualizan con cada
            visita. {{ contact.phoneDisplay }} · {{ contact.email }}
          </footer>
        </article>
      } @else {
        <p class="text-center text-muted-foreground">No encontramos esa propiedad.</p>
      }
    </div>
  `,
})
export class PanelOwnerReportComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(PropertyStore);
  private readonly stats = inject(StatsStore);
  private readonly inquiries = inject(InquiriesStore);
  private readonly visits = inject(VisitsStore);
  private readonly contacts = inject(ContactsStore);

  readonly contact = CONTACT;
  readonly statusLabels = STATUS_LABELS;
  readonly today = new Date();
  comments = '';

  private readonly id = this.route.snapshot.paramMap.get('id') ?? '';

  readonly report = computed(() => {
    const property = this.store.getById(this.id);
    if (!property) return null;
    const s = this.stats.get(property.slug);
    const consultas = this.inquiries.all().filter((q) => q.propertySlug === property.slug).length;
    const done = this.visits
      .all()
      .filter((v) => v.propertySlug === property.slug && v.status === 'realizada')
      .sort((a, b) => b.at.localeCompare(a.at));
    const feedbacks = done
      .filter((v) => v.feedback)
      .map((v) => ({
        at: v.at,
        who: (v.contactId ? this.contacts.get(v.contactId)?.name : v.visitorName) ?? 'Visitante',
        text: v.feedback as string,
        interest: v.interest,
      }));
    return {
      visitsDone: done.length,
      feedbacks,
      property,
      status: this.store.statusOf(property),
      quality: listingQuality(property),
      metrics: [
        { label: 'Vistas de la ficha', value: s.views },
        { label: 'Guardada en favoritas', value: s.favorites },
        { label: 'Consultas por WhatsApp', value: s.whatsapp },
        { label: 'Consultas recibidas', value: consultas },
        { label: 'Visitas realizadas', value: done.length },
        { label: 'Escaneos del cartel', value: s.qr },
        { label: 'Veces compartida', value: s.shares },
      ],
    };
  });

  print() {
    window.print();
  }
}
