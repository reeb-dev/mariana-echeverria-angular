import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { purchaseCosts, rentCosts } from '../data/calculators';
import { CONTACT } from '../data/properties';
import { SeoService } from '../utils/seo.service';

@Component({
  selector: 'app-calculators',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-5xl px-5 pt-[8.5rem] pb-24 md:px-8 md:pt-[9.5rem]">
      <a routerLink="/" class="text-sm text-muted-foreground transition hover:text-forest">← Volver al sitio</a>
      <p class="eyebrow mt-6 text-forest">Herramientas</p>
      <h1 class="section-title mt-3 text-3xl text-forest-deep md:text-4xl">Calculadoras</h1>
      <p class="mt-4 max-w-2xl text-muted-foreground">
        Una idea rápida de cuánto cuesta comprar y de lo que hay que tener para entrar a un alquiler. Los porcentajes son valores
        de referencia que podés cambiar: dependen de cada operación y se confirman con la escribanía.
      </p>

      <div class="mt-10 grid gap-8 lg:grid-cols-2">
        <!-- Compra -->
        <section class="rounded-2xl border border-border bg-background p-6 shadow-soft">
          <h2 class="font-display text-xl font-medium text-forest-deep">Gastos de una compra</h2>
          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <label class="sm:col-span-2">
              <span class="lbl">Precio de la propiedad</span>
              <input class="fld" type="number" min="0" [ngModel]="price()" (ngModelChange)="price.set(+$event || 0)" />
            </label>
            <label>
              <span class="lbl">Honorarios inmobiliaria (%)</span>
              <input class="fld" type="number" min="0" step="0.1" [ngModel]="agencyPct()" (ngModelChange)="agencyPct.set(+$event || 0)" />
            </label>
            <label>
              <span class="lbl">Sellos (%)</span>
              <input class="fld" type="number" min="0" step="0.1" [ngModel]="stampPct()" (ngModelChange)="stampPct.set(+$event || 0)" />
            </label>
            <label>
              <span class="lbl">Escribanía (%)</span>
              <input class="fld" type="number" min="0" step="0.1" [ngModel]="notaryPct()" (ngModelChange)="notaryPct.set(+$event || 0)" />
            </label>
            <label>
              <span class="lbl">Inscripciones y certificados (%)</span>
              <input class="fld" type="number" min="0" step="0.1" [ngModel]="otherPct()" (ngModelChange)="otherPct.set(+$event || 0)" />
            </label>
          </div>
          <dl class="mt-5 space-y-2 text-sm">
            @for (l of purchase().lines; track l.label) {
              <div class="flex justify-between gap-3">
                <dt class="text-muted-foreground">{{ l.label }} ({{ l.pct }}%)</dt>
                <dd class="tabular-nums">{{ fmt(l.amount) }}</dd>
              </div>
            }
            <div class="flex justify-between gap-3 border-t border-border pt-3 font-semibold text-forest-deep">
              <dt>Gastos totales</dt>
              <dd class="tabular-nums">{{ fmt(purchase().total) }}</dd>
            </div>
            <div class="flex justify-between gap-3 font-semibold text-forest-deep">
              <dt>Necesitás en total</dt>
              <dd class="tabular-nums">{{ fmt(purchase().totalWithPrice) }}</dd>
            </div>
          </dl>
        </section>

        <!-- Alquiler -->
        <section class="rounded-2xl border border-border bg-background p-6 shadow-soft">
          <h2 class="font-display text-xl font-medium text-forest-deep">Alquiler: ajuste y entrada</h2>
          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <label class="sm:col-span-2">
              <span class="lbl">Alquiler mensual actual</span>
              <input class="fld" type="number" min="0" [ngModel]="rent()" (ngModelChange)="rent.set(+$event || 0)" />
            </label>
            <label>
              <span class="lbl">Variación del índice en el período (%)</span>
              <input class="fld" type="number" step="0.1" [ngModel]="adjust()" (ngModelChange)="adjust.set(+$event || 0)" />
            </label>
            <label>
              <span class="lbl">Meses de depósito</span>
              <input class="fld" type="number" min="0" step="0.5" [ngModel]="depositMonths()" (ngModelChange)="depositMonths.set(+$event || 0)" />
            </label>
            <label>
              <span class="lbl">Honorarios (en alquileres)</span>
              <input class="fld" type="number" min="0" step="0.5" [ngModel]="agencyMonths()" (ngModelChange)="agencyMonths.set(+$event || 0)" />
            </label>
          </div>
          <dl class="mt-5 space-y-2 text-sm">
            <div class="flex justify-between gap-3">
              <dt class="text-muted-foreground">Alquiler ajustado</dt>
              <dd class="tabular-nums">{{ fmt(rentResult().adjustedRent) }}</dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-muted-foreground">Aumento mensual</dt>
              <dd class="tabular-nums">{{ fmt(rentResult().increase) }}</dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-muted-foreground">Depósito</dt>
              <dd class="tabular-nums">{{ fmt(rentResult().deposit) }}</dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-muted-foreground">Honorarios</dt>
              <dd class="tabular-nums">{{ fmt(rentResult().agency) }}</dd>
            </div>
            <div class="flex justify-between gap-3 border-t border-border pt-3 font-semibold text-forest-deep">
              <dt>Para entrar (primer mes + depósito + honorarios)</dt>
              <dd class="tabular-nums">{{ fmt(rentResult().moveInTotal) }}</dd>
            </div>
          </dl>
        </section>
      </div>

      <div class="mt-10 rounded-2xl border border-stone-warm/50 bg-stone-warm/15 p-6">
        <p class="font-medium text-forest-deep">Es una estimación, no un presupuesto.</p>
        <p class="mt-1 text-sm text-muted-foreground">
          Para una cifra exacta de tu operación, consultanos: {{ contact.matricula }} · {{ contact.phoneDisplay }}.
        </p>
        <a
          routerLink="/tasacion"
          class="mt-4 inline-flex h-11 items-center rounded-lg bg-forest-deep px-5 text-sm font-semibold text-stone-warm transition hover:bg-forest hover:text-white"
        >
          Pedí tu tasación
        </a>
      </div>
    </div>
  `,
  styles: [
    `
      .lbl {
        display: block;
        margin-bottom: 0.375rem;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #6a5748;
      }
      .fld {
        width: 100%;
        min-height: 2.75rem;
        border: 1px solid #e5d9cb;
        border-radius: 0.5rem;
        background: #faf7f2;
        padding: 0.5rem 0.875rem;
        font-size: 0.875rem;
        outline: none;
      }
      .fld:focus {
        border-color: #d06a28;
      }
    `,
  ],
})
export class CalculatorsComponent {
  readonly contact = CONTACT;

  readonly price = signal(54000);
  readonly agencyPct = signal(3);
  readonly stampPct = signal(1.5);
  readonly notaryPct = signal(2);
  readonly otherPct = signal(1);

  readonly rent = signal(300000);
  readonly adjust = signal(10);
  readonly depositMonths = signal(1);
  readonly agencyMonths = signal(1);

  readonly purchase = computed(() =>
    purchaseCosts({
      price: this.price(),
      agencyPct: this.agencyPct(),
      stampPct: this.stampPct(),
      notaryPct: this.notaryPct(),
      otherPct: this.otherPct(),
    })
  );

  readonly rentResult = computed(() =>
    rentCosts({
      monthlyRent: this.rent(),
      adjustmentPct: this.adjust(),
      months: 24,
      depositMonths: this.depositMonths(),
      agencyMonths: this.agencyMonths(),
    })
  );

  constructor() {
    inject(SeoService).set({
      title: 'Calculadoras de gastos de compra y alquiler | Mariana Echeverría Bienes Raíces',
      description: 'Estimá los gastos de una compra y lo que necesitás para entrar a un alquiler, con valores que podés ajustar.',
    });
  }

  fmt(value: number): string {
    return value.toLocaleString('es-AR', { maximumFractionDigits: 0 });
  }
}
