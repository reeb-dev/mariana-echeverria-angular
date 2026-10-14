import { ToastService } from '../../data/toast.service';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { localIsoDate } from '../../data/calculators';
import { ContactsStore } from '../../data/crm-stores';
import { DOCUMENT_TEMPLATES, renderTemplate, type DocumentTemplate } from '../../data/document-templates';
import { PropertyStore } from '../../data/property-store';
import { PanelShellComponent } from './panel-shell.component';

@Component({
  selector: 'app-panel-documents',
  standalone: true,
  imports: [FormsModule, PanelShellComponent],
  template: `
    <app-panel-shell title="Documentos">
      <p class="max-w-3xl text-sm text-muted-foreground">
        Modelos base para armar rápido autorizaciones, reservas y contratos con los datos de la operación. Son un punto de
        partida: <strong>los tiene que revisar y ajustar la abogada antes de firmarlos</strong>.
      </p>

      <div class="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section class="space-y-4">
          <ul class="grid gap-2">
            @for (t of templates; track t.id) {
              <li>
                <button
                  type="button"
                  class="w-full rounded-xl border bg-background p-3 text-left transition hover:border-forest"
                  [class]="template().id === t.id ? 'border-forest' : 'border-border'"
                  (click)="choose(t)"
                >
                  <span class="block font-medium text-forest-deep">{{ t.title }}</span>
                  <span class="block text-xs text-muted-foreground">{{ t.description }}</span>
                </button>
              </li>
            }
          </ul>

          <div class="mer-card p-4">
            <p class="font-semibold text-forest-deep">Completar con datos del sistema</p>
            <div class="mt-3 grid gap-3">
              <label class="text-xs text-muted-foreground">
                Propiedad
                <select class="inp mt-1" [ngModel]="propertySlug()" (ngModelChange)="fillFromProperty($event)">
                  <option value="">—</option>
                  @for (p of properties.all(); track p.id) {
                    <option [value]="p.slug">{{ p.title }}</option>
                  }
                </select>
              </label>
              <label class="text-xs text-muted-foreground">
                Contacto
                <select class="inp mt-1" [ngModel]="contactId()" (ngModelChange)="fillFromContact($event)">
                  <option value="">—</option>
                  @for (c of contacts.all(); track c.id) {
                    <option [value]="c.id">{{ c.name }}</option>
                  }
                </select>
              </label>
              <p class="text-xs text-muted-foreground">
                La propiedad completa el inmueble y el precio; el contacto, el nombre de la parte que corresponda. Se pueden
                corregir a mano.
              </p>
            </div>
          </div>

          <div class="mer-card p-4">
            <p class="font-semibold text-forest-deep">Datos del documento</p>
            <div class="mt-3 grid gap-3">
              @for (f of template().fields; track f.key) {
                <label class="text-xs text-muted-foreground">
                  {{ f.label }}
                  @if (f.type === 'textarea') {
                    <textarea class="inp mt-1 min-h-20 py-2" [name]="f.key" [ngModel]="values()[f.key]" (ngModelChange)="setValue(f.key, $event)"></textarea>
                  } @else {
                    <input
                      class="inp mt-1"
                      [name]="f.key"
                      [type]="f.type ?? 'text'"
                      [placeholder]="f.placeholder ?? ''"
                      [ngModel]="values()[f.key]"
                      (ngModelChange)="setValue(f.key, $event)"
                    />
                  }
                </label>
              }
            </div>
          </div>
        </section>

        <section>
          <div class="sticky top-4 rounded-xl border border-border bg-white p-6 shadow-soft print:border-0 print:shadow-none">
            <div class="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
              <p class="font-semibold text-forest-deep">Vista previa</p>
              <div class="flex gap-2">
                <button type="button" class="mini" (click)="copy()">{{ copied() ? '¡Copiado!' : 'Copiar texto' }}</button>
                <button type="button" class="mini" (click)="print()">Imprimir o guardar PDF</button>
              </div>
            </div>
            <pre class="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed">{{ rendered() }}</pre>
            <p class="mt-4 border-t border-border pt-3 text-xs text-muted-foreground print:hidden">
              Los datos que faltan aparecen entre corchetes. Modelo orientativo: revisalo antes de usarlo.
            </p>
          </div>
        </section>
      </div>
    </app-panel-shell>
  `,
  styles: [
    `
      .inp {
        width: 100%;
        min-height: 2.5rem;
        border: 1px solid #e5d9cb;
        border-radius: 0.5rem;
        background: #faf7f2;
        padding: 0 0.75rem;
        font-size: 0.875rem;
        outline: none;
        color: #1c1612;
      }
      .mini {
        height: 2.25rem;
        border: 1px solid #e5d9cb;
        border-radius: 0.5rem;
        padding: 0 0.75rem;
        font-size: 0.8125rem;
        font-weight: 500;
      }
    `,
  ],
})
export class PanelDocumentsComponent {
  protected readonly toast = inject(ToastService);
  readonly properties = inject(PropertyStore);
  readonly contacts = inject(ContactsStore);
  readonly templates = DOCUMENT_TEMPLATES;

  readonly template = signal<DocumentTemplate>(DOCUMENT_TEMPLATES[0]);
  readonly values = signal<Record<string, string>>({ ciudad: 'Coronel Suárez', fecha: localIsoDate() });
  readonly propertySlug = signal('');
  readonly contactId = signal('');
  readonly copied = signal(false);

  readonly rendered = computed(() => renderTemplate(this.template().body, this.values()));

  choose(t: DocumentTemplate) {
    this.template.set(t);
  }

  setValue(key: string, value: string) {
    this.values.update((v) => ({ ...v, [key]: value }));
  }

  fillFromProperty(slug: string) {
    this.propertySlug.set(slug);
    const p = this.properties.getBySlug(slug);
    if (!p) return;
    const inmueble = [p.title, p.location, p.areaLabel].filter(Boolean).join(' — ');
    this.values.update((v) => ({
      ...v,
      inmueble,
      campo: inmueble,
      precio: p.priceLabel,
      alquiler: p.operation === 'alquiler' ? p.priceLabel : (v['alquiler'] ?? ''),
      propietario: p.ownerName ?? v['propietario'] ?? '',
      locador: p.ownerName ?? v['locador'] ?? '',
      arrendador: p.ownerName ?? v['arrendador'] ?? '',
      dni_propietario: v['dni_propietario'] ?? '',
    }));
  }

  /** El contacto completa la parte «que no es el propietario»: según el tipo, comprador, locatario o arrendatario. */
  fillFromContact(id: string) {
    this.contactId.set(id);
    const c = this.contacts.get(id);
    if (!c) return;
    this.values.update((v) => ({
      ...v,
      ...(c.kind === 'propietario'
        ? { propietario: c.name, locador: c.name, arrendador: c.name }
        : { comprador: c.name, locatario: c.name, arrendatario: c.name }),
    }));
  }

  async copy() {
    try {
      await navigator.clipboard.writeText(this.rendered());
      this.copied.set(true);
      this.toast.success('Documento copiado.');
      setTimeout(() => this.copied.set(false), 1800);
    } catch {
      this.toast.error('No se pudo copiar. Seleccioná el texto y copialo a mano.');
    }
  }

  print() {
    window.print();
  }
}
