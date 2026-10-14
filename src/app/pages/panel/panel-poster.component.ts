import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import QRCode from 'qrcode';
import { PropertyStore } from '../../data/property-store';
import { BRANCH_LABELS, CONTACT, branchOf } from '../../data/properties';
import { AssetUrlPipe } from '../../utils/asset-url';

/** Cartel imprimible «Se vende / Se alquila» con un QR que lleva a la ficha y cuenta los escaneos. */
@Component({
  selector: 'app-panel-poster',
  standalone: true,
  imports: [RouterLink, AssetUrlPipe],
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
          Imprimir cartel
        </button>
      </div>

      @if (property; as p) {
        <article
          class="mx-auto flex min-h-[270mm] max-w-[210mm] flex-col items-center justify-between gap-5 bg-white px-[12mm] py-[10mm] text-center shadow-brand print:h-[277mm] print:min-h-0 print:shadow-none"
        >
          <header class="w-full">
            <p class="font-display text-xl text-forest-deep">{{ contact.brand }}</p>
            <p class="text-xs tracking-[0.2em] text-forest uppercase">{{ contact.tagline }}</p>
          </header>

          <!-- Vista de la propiedad -->
          <div class="w-full">
            <img
              [src]="p.photos[0].src | assetUrl"
              [alt]="p.photos[0].alt"
              class="h-[78mm] w-full rounded-lg object-cover"
            />
            @if (p.photos.length > 1) {
              <div class="mt-2 grid grid-cols-3 gap-2">
                @for (photo of p.photos.slice(1, 4); track $index) {
                  <img [src]="photo.src | assetUrl" [alt]="photo.alt" class="h-[26mm] w-full rounded-md object-cover" />
                }
              </div>
            }
          </div>

          <div>
            <p class="font-display text-5xl font-medium uppercase leading-none text-forest-deep">
              {{ p.operation === 'venta' ? 'Se vende' : 'Se alquila' }}
            </p>
            <p class="mx-auto mt-3 max-w-[150mm] text-2xl font-medium leading-snug text-forest-deep">{{ p.title }}</p>
            <p class="mt-1 text-lg text-muted-foreground">{{ p.location }}</p>
            <p class="mt-3 text-4xl font-semibold text-forest-deep">{{ p.priceLabel }}</p>
            <p class="mt-1 text-base text-muted-foreground">
              {{ p.areaLabel }}
              @if (p.beds != null) { · {{ p.beds }} dorm. }
              @if (p.baths != null) { · {{ p.baths }} baños }
            </p>
          </div>

          <div class="flex flex-col items-center">
            @if (qr(); as src) {
              <img [src]="src" alt="Código QR de la ficha" class="h-[44mm] w-[44mm]" />
            } @else {
              <div class="flex h-[44mm] w-[44mm] items-center justify-center text-sm text-muted-foreground">Generando QR…</div>
            }
            <p class="mt-2 text-base font-medium text-forest-deep">Escaneá para ver más fotos y consultar</p>
          </div>

          <footer class="w-full border-t border-border pt-3">
            <p class="text-xl font-semibold text-forest-deep">{{ contact.phoneDisplay }}</p>
            <p class="mt-1 text-base text-muted-foreground">
              {{ branchLabel(p) }} · {{ contact.matricula }} · &#64;{{ contact.instagram }}
            </p>
          </footer>
        </article>
      } @else {
        <p class="text-center text-muted-foreground">No encontramos esa propiedad.</p>
      }
    </div>
  `,
})
export class PanelPosterComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly store = inject(PropertyStore);
  readonly contact = CONTACT;

  readonly property = this.store.getById(this.route.snapshot.paramMap.get('id') ?? '');
  readonly qr = signal<string | null>(null);

  constructor() {
    const p = this.property;
    if (!p) return;
    // El parámetro src=cartel permite contar los escaneos en las estadísticas.
    const path = this.location.prepareExternalUrl(`/propiedades/${p.slug}`);
    const url = `${location.origin}${path}?src=cartel`;
    void QRCode.toDataURL(url, { margin: 1, width: 640, errorCorrectionLevel: 'M' }).then((data) => this.qr.set(data));
  }

  branchLabel(p: NonNullable<typeof this.property>) {
    return BRANCH_LABELS[branchOf(p)];
  }

  print() {
    window.print();
  }
}
