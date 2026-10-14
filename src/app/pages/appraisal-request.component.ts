import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  APPRAISAL_REASON_LABELS,
  AppraisalsStore,
  type AppraisalPropertyType,
  type AppraisalReason,
} from '../data/appraisals-store';
import { CONTACT } from '../data/properties';
import { SeoService } from '../utils/seo.service';

@Component({
  selector: 'app-appraisal-request',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-5xl px-5 pt-[8.5rem] pb-24 md:px-8 md:pt-[9.5rem]">
      <a routerLink="/" class="text-sm text-muted-foreground transition hover:text-forest">← Volver al sitio</a>

      <div class="mt-6 grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p class="eyebrow text-forest">Tasación</p>
          <h1 class="section-title mt-4 text-3xl text-forest-deep md:text-4xl">Pedí tu tasación en el día</h1>
          <p class="mt-5 leading-relaxed text-muted-foreground">
            Contanos qué inmueble querés valuar y para qué. Te respondemos por teléfono o WhatsApp para coordinar el
            relevamiento. En muchos casos la valuación sale el mismo día.
          </p>
          <ul class="mt-8 space-y-4">
            @for (item of reasons; track item.title) {
              <li class="border-l-2 border-forest/40 pl-4">
                <p class="font-medium text-forest-deep">{{ item.title }}</p>
                <p class="text-sm text-muted-foreground">{{ item.detail }}</p>
              </li>
            }
          </ul>
          <p class="mt-8 text-sm text-muted-foreground">
            {{ contact.matricula }} · Corredora, tasadora y martillera pública.
          </p>
        </div>

        <div>
          @if (sent()) {
            <div class="rounded-2xl border border-border bg-background p-8 text-center shadow-soft" role="status">
              <p class="font-display text-2xl font-medium text-forest-deep">¡Recibimos tu pedido!</p>
              <p class="mt-3 text-muted-foreground">
                Abrimos WhatsApp con el resumen. Si no se abrió, escribinos al {{ contact.phoneDisplay }}. Te contactamos
                a la brevedad para coordinar.
              </p>
              <button
                type="button"
                class="mt-6 h-11 rounded-lg border border-border px-5 text-sm font-medium transition hover:border-forest"
                (click)="sent.set(false)"
              >
                Pedir otra tasación
              </button>
            </div>
          } @else {
            <form class="space-y-5 rounded-2xl border border-border bg-background p-6 shadow-soft" (submit)="submit($event)" novalidate>
              <div class="grid gap-5 sm:grid-cols-2">
                <label>
                  <span class="lbl">Tipo de inmueble *</span>
                  <select class="fld" name="propertyType" [(ngModel)]="form.propertyType">
                    <option value="casa">Casa</option>
                    <option value="departamento">Departamento</option>
                    <option value="local">Local comercial</option>
                    <option value="lote">Lote o terreno</option>
                    <option value="campo">Campo</option>
                    <option value="otro">Otro</option>
                  </select>
                </label>
                <label>
                  <span class="lbl">Motivo *</span>
                  <select class="fld" name="reason" [(ngModel)]="form.reason">
                    @for (r of reasonOptions; track r.id) {
                      <option [value]="r.id">{{ r.label }}</option>
                    }
                  </select>
                </label>
                <label class="sm:col-span-2">
                  <span class="lbl">Dirección o ubicación *</span>
                  <input class="fld" name="address" [(ngModel)]="form.address" placeholder="Calle y número, localidad" />
                </label>
                <label>
                  <span class="lbl">Superficie aproximada</span>
                  <input class="fld" name="area" [(ngModel)]="form.area" placeholder="180 m² o 45 ha" />
                </label>
                <label>
                  <span class="lbl">Tu nombre *</span>
                  <input class="fld" name="name" autocomplete="name" [(ngModel)]="form.name" />
                </label>
                <label>
                  <span class="lbl">Teléfono *</span>
                  <input class="fld" type="tel" name="phone" autocomplete="tel" [(ngModel)]="form.phone" />
                </label>
                <label>
                  <span class="lbl">Email</span>
                  <input class="fld" type="email" name="email" autocomplete="email" [(ngModel)]="form.email" />
                </label>
                <label class="sm:col-span-2">
                  <span class="lbl">Algo más que quieras contarnos</span>
                  <textarea class="fld min-h-24" name="details" [(ngModel)]="form.details"></textarea>
                </label>
              </div>

              <label class="flex items-start gap-3 text-sm">
                <input type="checkbox" class="mt-1 h-4 w-4" name="consent" [(ngModel)]="form.consent" />
                <span>
                  Acepto que usen mis datos para contactarme por esta tasación, según la
                  <a routerLink="/privacidad" target="_blank" class="text-forest underline underline-offset-2">política de privacidad</a>.
                </span>
              </label>

              @if (error(); as message) {
                <p class="text-sm text-red-700" role="alert">{{ message }}</p>
              }

              <button
                type="submit"
                class="h-12 w-full rounded-lg bg-forest-deep text-sm font-semibold text-stone-warm transition hover:bg-forest hover:text-white"
              >
                Pedir tasación
              </button>
            </form>
          }
        </div>
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
        letter-spacing: 0.08em;
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
        box-shadow: 0 0 0 2px rgb(208 106 40 / 0.2);
      }
    `,
  ],
})
export class AppraisalRequestComponent {
  private readonly store = inject(AppraisalsStore);
  readonly contact = CONTACT;

  readonly reasons = [
    { title: 'Para vender o alquilar', detail: 'Un precio de mercado realista para publicar con respaldo.' },
    { title: 'Sucesiones y divisiones', detail: 'Valuación con mirada legal, porque además de tasadora soy abogada.' },
    { title: 'Garantías y créditos', detail: 'Informe de valor para presentar ante bancos o escribanía.' },
  ];

  readonly reasonOptions = (Object.keys(APPRAISAL_REASON_LABELS) as AppraisalReason[]).map((id) => ({
    id,
    label: APPRAISAL_REASON_LABELS[id],
  }));

  readonly sent = signal(false);
  readonly error = signal<string | null>(null);

  form = {
    propertyType: 'casa' as AppraisalPropertyType,
    reason: 'venta' as AppraisalReason,
    address: '',
    area: '',
    name: '',
    phone: '',
    email: '',
    details: '',
    consent: false,
  };

  constructor() {
    inject(SeoService).set({
      title: 'Pedí tu tasación en el día | Mariana Echeverría Bienes Raíces',
      description:
        'Tasación de casas, departamentos, lotes, locales y campos en Coronel Suárez y Zona Norte. Para venta, sucesión, garantía o refinanciación.',
    });
  }

  submit(event: Event) {
    event.preventDefault();
    const f = this.form;
    if (!f.address.trim() || !f.name.trim() || !f.phone.trim()) {
      this.error.set('Completá la dirección, tu nombre y tu teléfono.');
      return;
    }
    if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) {
      this.error.set('Revisá el email: el formato no parece válido.');
      return;
    }
    if (!f.consent) {
      this.error.set('Tenés que aceptar la política de privacidad para enviar el pedido.');
      return;
    }
    this.error.set(null);

    this.store.add({
      name: f.name.trim(),
      phone: f.phone.trim(),
      email: f.email.trim(),
      propertyType: f.propertyType,
      reason: f.reason,
      address: f.address.trim(),
      area: f.area.trim() || undefined,
      details: f.details.trim() || undefined,
    });

    const lines = [
      `Hola Mariana, soy ${f.name.trim()}. Quiero pedir una tasación.`,
      `Inmueble: ${f.propertyType} en ${f.address.trim()}${f.area.trim() ? ` (${f.area.trim()})` : ''}`,
      `Motivo: ${APPRAISAL_REASON_LABELS[f.reason]}`,
      `Teléfono: ${f.phone.trim()}`,
      f.details.trim() ? `Detalle: ${f.details.trim()}` : '',
    ].filter(Boolean);
    window.open(
      `${CONTACT.whatsappUrl}?text=${encodeURIComponent(lines.join('\n'))}`,
      '_blank',
      'noopener,noreferrer'
    );
    this.sent.set(true);
    this.form = { ...this.form, address: '', area: '', name: '', phone: '', email: '', details: '', consent: false };
  }
}
