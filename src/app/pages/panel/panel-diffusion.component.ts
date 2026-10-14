import { DatePipe, Location } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AiCopyService, templatePackage, type CopyPackage } from '../../data/ai-copy.service';
import { CHANNEL_LABELS, DiffusionStore, type DiffusionChannel } from '../../data/diffusion-store';
import { PublishingService, type ChannelStatus } from '../../data/publishing.service';
import { PropertyStore } from '../../data/property-store';
import { CONTACT, labelForZone, type Property } from '../../data/properties';
import { ToastService } from '../../data/toast.service';
import { resolveAssetUrl } from '../../utils/asset-url';
import { renderReel, renderStill, type MediaInput } from '../../utils/social-media';
import { PanelShellComponent } from './panel-shell.component';

type TextChannel = 'instagram' | 'facebook' | 'mercadolibre' | 'whatsapp';

/** Difundir una propiedad: textos por canal, imágenes y un reel armados con sus fotos, y seguimiento de dónde ya se publicó. */
@Component({
  selector: 'app-panel-diffusion',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe, PanelShellComponent],
  template: `
    <app-panel-shell title="Difundir propiedad">
      @if (property(); as p) {
        <a routerLink="/panel/propiedades" class="text-sm text-muted-foreground transition hover:text-forest">← Volver a propiedades</a>
        <h2 class="mt-3 font-display text-2xl font-medium text-forest-deep">{{ p.title }}</h2>
        <p class="text-sm text-muted-foreground">{{ p.location }} · {{ p.priceLabel }} · {{ p.photos.length }} fotos</p>

        @if (p.photos.length === 0) {
          <p class="mt-4 rounded-lg border border-border bg-background px-4 py-3 text-sm text-red-700">
            Esta propiedad no tiene fotos: cargá al menos una para armar imágenes y video.
          </p>
        }

        <!-- Dónde está publicada -->
        <section class="mer-card mt-6 p-5">
          <h3 class="font-display text-lg font-medium text-forest-deep">Dónde está publicada</h3>
          <p class="mt-1 text-xs text-muted-foreground">
            Cuando la publiques en cada lugar, marcala acá para tener claro dónde falta.
          </p>
          @if (!anyConnected()) {
            <p class="mt-3 rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
              Publicación automática: <strong>sin conexión</strong>. Hace falta un servidor con las cuentas de Instagram,
              Facebook y Mercado Libre vinculadas (ver <code>PUBLICACION.md</code>). Mientras tanto, usá los textos, las
              imágenes y el reel de abajo y marcá acá dónde ya publicaste.
            </p>
          }
          <ul class="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            @for (c of channels; track c) {
              <li class="flex items-center gap-3 rounded-xl border border-border p-3">
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-forest-deep">{{ labels[c] }}</p>
                  @if (diffusion.find(p.id, c); as d) {
                    <p class="text-xs text-forest">Publicada el {{ d.at | date: 'dd/MM/yyyy' }}</p>
                  } @else {
                    <p class="text-xs text-muted-foreground">Sin publicar</p>
                  }
                </div>
                @if (connected()[c] && c !== 'whatsapp' && !diffusion.find(p.id, c)) {
                  <button
                    type="button"
                    class="shrink-0 rounded-lg bg-forest-deep px-3 py-1.5 text-xs font-semibold text-stone-warm transition hover:bg-forest hover:text-white disabled:opacity-50"
                    [disabled]="publishing() !== null"
                    (click)="publishNow(p, c)"
                  >
                    {{ publishing() === c ? 'Publicando…' : 'Publicar ahora' }}
                  </button>
                }
                <button
                  type="button"
                  class="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:border-forest"
                  (click)="mark(p, c)"
                >
                  {{ diffusion.find(p.id, c) ? 'Quitar' : 'Marcar' }}
                </button>
              </li>
            }
          </ul>
        </section>

        <!-- Textos -->
        <section class="mer-card mt-6 p-5">
          <h3 class="font-display text-lg font-medium text-forest-deep">Textos listos para pegar</h3>
          <div class="mt-3 flex flex-wrap gap-2" role="tablist">
            @for (c of channels; track c) {
              <button
                type="button"
                role="tab"
                class="filter-chip"
                [class.filter-chip-active]="tab() === c"
                [class.filter-chip-idle]="tab() !== c"
                [attr.aria-selected]="tab() === c"
                (click)="tab.set(c)"
              >
                {{ labels[c] }}
              </button>
            }
          </div>
          @if (tab() === 'mercadolibre') {
            <p class="mt-4 text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              Título <span class="font-normal normal-case">({{ mlTitle().length }}/60)</span>
            </p>
            <p class="mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm">{{ mlTitle() }}</p>
            <button type="button" class="mt-2 text-sm font-medium text-forest underline" (click)="copy(mlTitle(), 'Título')">Copiar título</button>
          }
          <textarea
            class="mt-4 min-h-48 w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-forest"
            [ngModel]="text()"
            (ngModelChange)="edited.set($event)"
            name="text"
            [attr.aria-label]="'Texto para ' + labels[tab()]"
          ></textarea>
          <div class="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              class="inline-flex h-10 items-center rounded-lg bg-forest-deep px-4 text-sm font-semibold text-stone-warm transition hover:bg-forest hover:text-white"
              (click)="copy(text(), 'Texto')"
            >
              Copiar texto
            </button>
            <button type="button" class="text-sm text-muted-foreground underline transition hover:text-forest" (click)="edited.set(null)">
              Volver al texto original
            </button>
            @if (pack() && pack()!.source === 'plantilla') {
              <span class="text-xs text-muted-foreground">Armado con una plantilla a partir de los datos cargados.</span>
            }
          </div>
        </section>

        <!-- Imágenes -->
        <section class="mer-card mt-6 p-5">
          <h3 class="font-display text-lg font-medium text-forest-deep">Imágenes para publicar</h3>
          <p class="mt-1 text-xs text-muted-foreground">
            Con la foto de portada, el precio, la ubicación y el logo. Para el feed o las historias.
          </p>
          <div class="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              class="inline-flex h-11 items-center rounded-lg border border-border px-5 text-sm font-medium transition hover:border-forest disabled:opacity-50"
              [disabled]="busy() || p.photos.length === 0"
              (click)="still(p, 'post')"
            >
              Descargar publicación (1080×1080)
            </button>
            <button
              type="button"
              class="inline-flex h-11 items-center rounded-lg border border-border px-5 text-sm font-medium transition hover:border-forest disabled:opacity-50"
              [disabled]="busy() || p.photos.length === 0"
              (click)="still(p, 'story')"
            >
              Descargar historia (1080×1920)
            </button>
          </div>
        </section>

        <!-- Reel -->
        <section class="mer-card mt-6 p-5">
          <h3 class="font-display text-lg font-medium text-forest-deep">Reel en video</h3>
          <p class="mt-1 text-xs text-muted-foreground">
            Un video vertical con hasta 6 fotos en movimiento, los datos de la propiedad y una tarjeta final con el contacto.
            Se arma en este navegador y tarda lo que dura el video.
          </p>
          <div class="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              class="inline-flex h-11 items-center rounded-lg bg-forest-deep px-5 text-sm font-semibold text-stone-warm transition hover:bg-forest hover:text-white disabled:opacity-50"
              [disabled]="busy() || p.photos.length === 0"
              (click)="reel(p)"
            >
              {{ reelBusy() ? 'Armando el video… ' + progress() + '%' : 'Armar el reel' }}
            </button>
            @if (reelBusy()) {
              <div class="h-2 w-48 overflow-hidden rounded-full bg-border" role="progressbar" [attr.aria-valuenow]="progress()">
                <div class="h-full bg-forest transition-all" [style.width.%]="progress()"></div>
              </div>
            }
          </div>
          @if (reelUrl(); as url) {
            <div class="mt-5 grid gap-5 sm:grid-cols-[14rem_1fr]">
              <video [src]="url" controls playsinline class="aspect-[9/16] w-full max-w-[14rem] rounded-xl bg-black"></video>
              <div class="space-y-3 text-sm">
                <p class="text-muted-foreground">
                  Listo: {{ reelSeconds() }} segundos, formato {{ reelExt().toUpperCase() }}. Subilo desde Instagram como reel
                  o desde Facebook; el texto de arriba sirve de epígrafe.
                </p>
                <a
                  [href]="url"
                  [download]="fileBase(p) + '-reel.' + reelExt()"
                  class="inline-flex h-11 items-center rounded-lg bg-stone-warm px-5 font-semibold text-forest-deep transition hover:bg-[#e8c056]"
                >
                  Descargar el video
                </a>
                @if (reelExt() === 'webm') {
                  <p class="text-xs text-muted-foreground">
                    Este navegador lo genera en WebM. Instagram suele aceptarlo; si no, abrilo con Chrome o convertilo a MP4.
                  </p>
                }
              </div>
            </div>
          }
        </section>

        <!-- Publicar -->
        <section class="mer-card mt-6 p-5">
          <h3 class="font-display text-lg font-medium text-forest-deep">Abrir cada red</h3>
          <p class="mt-1 text-xs text-muted-foreground">
            La publicación automática necesita conectar las cuentas con un servidor; mientras tanto, cada botón abre la
            plataforma para pegar el texto y subir la imagen o el video.
          </p>
          <div class="mt-4 flex flex-wrap gap-3">
            <a [href]="links.instagram" target="_blank" rel="noopener noreferrer" class="link-btn">Instagram</a>
            <a [href]="facebookShare(p)" target="_blank" rel="noopener noreferrer" class="link-btn">Compartir en Facebook</a>
            <a [href]="links.mercadolibre" target="_blank" rel="noopener noreferrer" class="link-btn">Mercado Libre</a>
            <a [href]="whatsappShare(p)" target="_blank" rel="noopener noreferrer" class="link-btn">Enviar por WhatsApp</a>
          </div>
        </section>
      } @else {
        <p class="text-muted-foreground">No se encontró la propiedad.</p>
        <a routerLink="/panel/propiedades" class="mt-3 inline-block text-forest underline">Volver a propiedades</a>
      }
    </app-panel-shell>
  `,
  styles: [
    `
      .link-btn {
        display: inline-flex;
        height: 2.75rem;
        align-items: center;
        border: 1px solid #e5d9cb;
        border-radius: 0.5rem;
        padding: 0 1.25rem;
        font-size: 0.875rem;
        font-weight: 500;
        transition: border-color 0.15s;
      }
      .link-btn:hover {
        border-color: #2d5a3d;
      }
    `,
  ],
})
export class PanelDiffusionComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly store = inject(PropertyStore);
  private readonly copyService = inject(AiCopyService);
  private readonly toast = inject(ToastService);
  private readonly publisher = inject(PublishingService);
  readonly diffusion = inject(DiffusionStore);

  readonly channels: DiffusionChannel[] = ['instagram', 'facebook', 'mercadolibre', 'whatsapp'];
  readonly labels = CHANNEL_LABELS;
  readonly links = { instagram: 'https://www.instagram.com/', mercadolibre: 'https://www.mercadolibre.com.ar/' };

  readonly property = computed(() => this.store.getById(this.route.snapshot.paramMap.get('id') ?? '') ?? null);
  readonly tab = signal<TextChannel>('instagram');
  readonly pack = signal<CopyPackage | null>(null);
  /** Texto que la persona editó (si no, se usa el generado). */
  readonly edited = signal<string | null>(null);

  /** Canales con la cuenta conectada en el servidor. */
  readonly connected = signal<ChannelStatus>({});
  readonly anyConnected = computed(() => Object.values(this.connected()).some(Boolean));
  readonly publishing = signal<DiffusionChannel | null>(null);

  readonly busy = signal(false);
  readonly reelBusy = signal(false);
  readonly progress = signal(0);
  readonly reelUrl = signal<string | null>(null);
  readonly reelExt = signal<'mp4' | 'webm'>('mp4');
  readonly reelSeconds = signal(0);

  readonly mlTitle = computed(() => this.pack()?.mercadolibre_titulo ?? '');
  readonly text = computed(() => {
    const edited = this.edited();
    if (edited !== null) return edited;
    const pack = this.pack();
    if (!pack) return '';
    switch (this.tab()) {
      case 'instagram':
        return pack.instagram;
      case 'facebook':
        return pack.facebook;
      case 'mercadolibre':
        return pack.mercadolibre_descripcion;
      default:
        return pack.whatsapp;
    }
  });

  constructor() {
    const p = this.property();
    if (!p) return;
    const input = {
      tone: 'cercano' as const,
      property: {
        operation: p.operation,
        type: p.type,
        zone: labelForZone(p.zone),
        location: p.location,
        priceLabel: p.priceLabel,
        areaLabel: p.areaLabel,
        beds: p.beds,
        baths: p.baths,
        highlight: p.highlight,
        amenities: p.amenities,
        description: p.description,
      },
      photos: [],
    };
    // Primero la plantilla (inmediata) y, si hay servidor de IA, se mejora.
    void this.publisher.status().then((s) => this.connected.set(s));
    this.pack.set(templatePackage(input));
    void this.copyService.generate(input).then((pack) => this.pack.set(pack));
  }

  async copy(text: string, what: string) {
    try {
      await navigator.clipboard.writeText(text);
      this.toast.success(`${what} copiado.`);
    } catch {
      this.toast.error('No se pudo copiar. Seleccioná el texto y copialo a mano.');
    }
  }

  mark(p: Property, channel: DiffusionChannel) {
    const on = this.diffusion.toggle(p.id, channel);
    this.toast.success(on ? `Marcada como publicada en ${CHANNEL_LABELS[channel]}.` : `Quitaste la marca de ${CHANNEL_LABELS[channel]}.`);
  }

  /** Texto de un canal: el generado, o el que se editó si es la pestaña abierta. */
  private textFor(channel: DiffusionChannel): string {
    if (this.tab() === channel && this.edited() !== null) return this.edited()!;
    const pack = this.pack();
    if (!pack) return '';
    return channel === 'instagram'
      ? pack.instagram
      : channel === 'facebook'
        ? pack.facebook
        : channel === 'mercadolibre'
          ? pack.mercadolibre_descripcion
          : pack.whatsapp;
  }

  /** Publica en la plataforma a través del servidor y deja marcado el canal. */
  async publishNow(p: Property, channel: DiffusionChannel) {
    this.publishing.set(channel);
    try {
      const input = this.mediaInput(p);
      let media: { blob: Blob; kind: 'image' | 'video'; filename: string } | undefined;
      if (channel === 'instagram' || channel === 'facebook') {
        const reelUrl = this.reelUrl();
        if (reelUrl) {
          media = { blob: await (await fetch(reelUrl)).blob(), kind: 'video', filename: `${this.fileBase(p)}-reel.${this.reelExt()}` };
        } else {
          media = { blob: await renderStill(input, 'post'), kind: 'image', filename: `${this.fileBase(p)}-publicacion.png` };
        }
      }
      const result = await this.publisher.publish(channel, {
        propertyId: p.id,
        slug: p.slug,
        title: p.title,
        text: this.textFor(channel),
        listingTitle: channel === 'mercadolibre' ? this.mlTitle() : undefined,
        photoUrls: input.photos.map((u) => new URL(u, document.baseURI).href),
        media,
      });
      if (result.ok) {
        if (!this.diffusion.find(p.id, channel)) this.diffusion.toggle(p.id, channel);
        this.toast.success(`Publicada en ${CHANNEL_LABELS[channel]}.`);
      } else {
        this.toast.error(result.error);
      }
    } catch {
      this.toast.error('No se pudo preparar la publicación.');
    } finally {
      this.publishing.set(null);
    }
  }

  fileBase(p: Property): string {
    return p.slug || 'propiedad';
  }

  private mediaInput(p: Property): MediaInput {
    const resolve = (path: string) => resolveAssetUrl(path, (u) => this.location.prepareExternalUrl(u));
    const facts = [
      /\d/.test(p.areaLabel) ? p.areaLabel : '',
      p.beds != null ? `${p.beds} dorm.` : '',
      p.baths != null ? `${p.baths} ${p.baths === 1 ? 'baño' : 'baños'}` : '',
    ]
      .filter(Boolean)
      .join(' · ');
    return {
      photos: p.photos.map((ph) => resolve(ph.src)),
      title: p.title,
      location: p.location,
      priceLabel: p.priceLabel,
      operation: p.operation === 'alquiler' ? 'alquiler' : 'venta',
      facts,
      phone: CONTACT.phoneDisplay,
      logoUrl: resolve('/about/logo-watermark.png'),
      brand: `${CONTACT.brand} ${CONTACT.tagline}`,
    };
  }

  private download(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  async still(p: Property, format: 'post' | 'story') {
    this.busy.set(true);
    try {
      const blob = await renderStill(this.mediaInput(p), format);
      this.download(blob, `${this.fileBase(p)}-${format === 'post' ? 'publicacion' : 'historia'}.png`);
      this.toast.success('Imagen descargada.');
    } catch {
      this.toast.error('No se pudo armar la imagen. Probá con otra foto de portada.');
    } finally {
      this.busy.set(false);
    }
  }

  async reel(p: Property) {
    this.busy.set(true);
    this.reelBusy.set(true);
    this.progress.set(0);
    const previous = this.reelUrl();
    if (previous) URL.revokeObjectURL(previous);
    this.reelUrl.set(null);
    try {
      const result = await renderReel(this.mediaInput(p), (r) => this.progress.set(Math.round(r * 100)));
      this.reelUrl.set(URL.createObjectURL(result.blob));
      this.reelExt.set(result.extension);
      this.reelSeconds.set(result.seconds);
      this.toast.success('El reel está listo.');
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'No se pudo armar el video.');
    } finally {
      this.reelBusy.set(false);
      this.busy.set(false);
    }
  }

  private siteUrl(p: Property): string {
    return location.origin + this.location.prepareExternalUrl(`/propiedades/${p.slug}`);
  }

  facebookShare(p: Property): string {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.siteUrl(p))}`;
  }

  whatsappShare(p: Property): string {
    return `https://wa.me/?text=${encodeURIComponent(`${p.title} – ${p.priceLabel}\n${this.siteUrl(p)}`)}`;
  }
}
