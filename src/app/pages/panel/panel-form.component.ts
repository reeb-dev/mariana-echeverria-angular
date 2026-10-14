import { ZonesStore } from '../../data/zones-store';
import { ToastService } from '../../data/toast.service';
import { DatePipe, Location } from '@angular/common';
import { Component, DestroyRef, HostListener, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LocationPickerComponent } from '../../components/location-picker.component';
import { PropertyCardComponent } from '../../components/property-card.component';
import { AiCopyService, TONE_LABELS, type AiTone, type CopyPackage } from '../../data/ai-copy.service';
import { ActivityLog } from '../../data/activity-log';
import { AuthService } from '../../data/auth.service';
import { listingQuality } from '../../data/listing-quality';
import { MAX_FEATURED, PropertyStore, slugify } from '../../data/property-store';
import { UsersStore } from '../../data/users-store';
import {
  BRANCH_LABELS,
  STATUS_LABELS,
  ZONE_LABELS,
  labelForZone,
  type Property,
  type PropertyBranch,
  type PropertyOperation,
  type PropertyPhoto,
  type PropertyStatus,
  type PropertyType,
} from '../../data/properties';
import { AssetUrlPipe, resolveAssetUrl } from '../../utils/asset-url';
import { PanelShellComponent } from './panel-shell.component';

const MAX_PHOTOS = 12;
const MAX_PHOTO_SIDE = 1280;
const PHOTO_QUALITY = 0.75;

/** Logo de la inmobiliaria (se carga una sola vez). Si no se puede cargar, la foto se guarda sin marca. */
let logoPromise: Promise<HTMLImageElement | null> | null = null;
function loadLogo(): Promise<HTMLImageElement | null> {
  logoPromise ??= new Promise((resolve) => {
    const logo = new Image();
    logo.onload = () => resolve(logo);
    logo.onerror = () => resolve(null);
    logo.src = new URL('about/logo-watermark.png', document.baseURI).href;
  });
  return logoPromise;
}

/** Estampa el logo arriba a la izquierda sobre una placa oscura (se lee sobre cualquier foto) y repetido, tenue, en diagonal. */
function drawWatermark(ctx: CanvasRenderingContext2D, width: number, height: number, logo: HTMLImageElement): void {
  const ratio = logo.naturalHeight / logo.naturalWidth;

  // logo repetido en diagonal
  const tileW = Math.max(90, width / 6);
  const tileH = tileW * ratio;
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.translate(width / 2, height / 2);
  ctx.rotate((-25 * Math.PI) / 180);
  const reach = Math.hypot(width, height) / 2;
  for (let y = -reach, row = 0; y < reach; y += tileH * 3.4, row++) {
    for (let x = -reach + (row % 2) * tileW * 0.9; x < reach; x += tileW * 2.6) {
      ctx.drawImage(logo, x, y, tileW, tileH);
    }
  }
  ctx.restore();

  // sello
  const badgeW = Math.max(110, width / 7);
  const badgeH = badgeW * ratio;
  const m = Math.max(6, badgeH / 4);
  const edge = Math.max(12, width / 60);
  const x = edge;
  const y = edge;
  ctx.save();
  ctx.fillStyle = 'rgba(20,20,20,0.35)';
  ctx.beginPath();
  ctx.roundRect(x, y, badgeW + m * 2, badgeH + m * 2, m);
  ctx.fill();
  ctx.globalAlpha = 0.85;
  ctx.drawImage(logo, x + m, y + m, badgeW, badgeH);
  ctx.restore();
}

/** Achica la foto en el navegador antes de guardarla (el celular saca fotos de varios MB). */
function compressImage(file: File, watermark = false): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = async () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_PHOTO_SIDE / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('canvas'));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      if (watermark) {
        const logo = await loadLogo();
        if (logo) drawWatermark(ctx, canvas.width, canvas.height, logo);
      }
      resolve(canvas.toDataURL('image/jpeg', PHOTO_QUALITY));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('image'));
    };
    img.src = url;
  });
}

@Component({
  selector: 'app-panel-form',
  standalone: true,
  imports: [FormsModule, DatePipe, RouterLink, AssetUrlPipe, PanelShellComponent, PropertyCardComponent, LocationPickerComponent],
  template: `
    <app-panel-shell [title]="isNew() ? 'Nueva propiedad' : 'Editar propiedad'">
      @if (!allowed()) {
        <p class="text-muted-foreground">
          Tu usuario no puede crear propiedades.
          <a routerLink="/panel/propiedades" class="text-forest underline">Volver al listado</a>
        </p>
      } @else if (notFound()) {
        <p class="text-muted-foreground">
          No encontramos esa propiedad.
          <a routerLink="/panel/propiedades" class="text-forest underline">Volver al listado</a>
        </p>
      } @else {
        <form class="space-y-8" (submit)="save($event)" novalidate>
          @if (errors().length > 0) {
            <div class="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              <p class="font-semibold">Revisá estos datos antes de guardar:</p>
              <ul class="mt-1 list-disc pl-5">
                @for (e of errors(); track e) {
                  <li>{{ e }}</li>
                }
              </ul>
            </div>
          }

          @if (readonly()) {
            <p class="rounded-lg border border-stone-warm/50 bg-stone-warm/15 px-4 py-3 text-sm text-forest-deep">
              Estás viendo esta propiedad en modo solo lectura: no tenés permiso para editarla.
            </p>
          }
          <fieldset [disabled]="readonly()" class="min-w-0 space-y-8 border-0 p-0">
          <!-- Datos principales -->
          <section class="grid gap-5 mer-card p-5 md:grid-cols-2">
            <label class="md:col-span-2">
              <span class="field-label">Título del aviso *</span>
              <input class="field" name="title" [(ngModel)]="draft.title" placeholder="Casa en venta – Mitre 2000" />
            </label>
            <label>
              <span class="field-label">Operación *</span>
              <select class="field" name="operation" [(ngModel)]="draft.operation">
                <option value="venta">Venta</option>
                <option value="alquiler">Alquiler</option>
              </select>
            </label>
            <label>
              <span class="field-label">Tipo *</span>
              <select class="field" name="type" [(ngModel)]="draft.type">
                @for (t of types; track t) {
                  <option [value]="t">{{ t }}</option>
                }
              </select>
            </label>
            <label>
              <span class="field-label">Zona *</span>
              <select class="field" name="zoneSelect" [ngModel]="zoneChoice()" (ngModelChange)="chooseZone($event)">
                <option value="">Elegí una zona…</option>
                @for (z of zoneNames(); track z) {
                  <option [value]="z">{{ z }}</option>
                }
                <option value="__nueva">＋ Agregar zona nueva…</option>
              </select>
              @if (addingZone()) {
                <input
                  class="field mt-2"
                  name="zone"
                  [(ngModel)]="zoneInput"
                  placeholder="Nombre de la zona nueva"
                  autocomplete="off"
                />
              }
            </label>
            <label>
              <span class="field-label">Ubicación (como se muestra) *</span>
              <input class="field" name="location" [(ngModel)]="draft.location" placeholder="Mitre 2000, Coronel Suárez" />
            </label>
            <label>
              <span class="field-label">Precio (como se muestra) *</span>
              <input class="field" name="priceLabel" [(ngModel)]="draft.priceLabel" placeholder="USD 54.000 o Consultar" />
            </label>
            <label>
              <span class="field-label">Superficie (como se muestra) *</span>
              <input class="field" name="areaLabel" [(ngModel)]="draft.areaLabel" placeholder="180 m²" />
            </label>
            <div class="md:col-span-2">
              <span class="field-label">Lo que tiene</span>
              <div class="grid grid-cols-3 gap-3">
                @for (s of steppers; track s.key) {
                  <div class="rounded-xl border border-border bg-background p-3 text-center">
                    <p class="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">{{ s.label }}</p>
                    <div class="mt-2 flex items-center justify-center gap-3">
                      <button type="button" class="h-9 w-9 rounded-full border border-border text-lg transition hover:border-forest" (click)="step(s.key, -1)" [attr.aria-label]="'Menos ' + s.label.toLowerCase()">−</button>
                      <span class="w-8 font-display text-2xl text-forest-deep tabular-nums">{{ stepValue(s.key) ?? '—' }}</span>
                      <button type="button" class="h-9 w-9 rounded-full border border-border text-lg transition hover:border-forest" (click)="step(s.key, 1)" [attr.aria-label]="'Más ' + s.label.toLowerCase()">+</button>
                    </div>
                  </div>
                }
              </div>
            </div>
            <label class="md:col-span-2">
              <span class="field-label">Destacado corto (opcional)</span>
              <input class="field" name="highlight" [(ngModel)]="draft.highlight" placeholder="Casa familiar" />
            </label>
            <label class="md:col-span-2">
              <span class="field-label">
                Descripción *
                <span class="ml-2 font-normal normal-case tracking-normal">{{ draft.description.length }} caracteres</span>
              </span>
              <textarea class="field min-h-32" name="description" [(ngModel)]="draft.description"></textarea>
              <span class="mt-1 block text-xs text-muted-foreground">
                Sugerencia: entre 300 y 1000 caracteres. Contá ubicación, ambientes, estado y qué la hace especial.
              </span>
            </label>
            <div class="md:col-span-2">
              @if (popularAmenities().length > 0) {
                <span class="field-label">Las más usadas en tus propiedades</span>
                <div class="mb-4 flex flex-wrap gap-2">
                  @for (a of popularAmenities(); track a.name) {
                    <button
                      type="button"
                      class="filter-chip"
                      [class.filter-chip-active]="hasAmenity(a.name)"
                      [class.filter-chip-idle]="!hasAmenity(a.name)"
                      [attr.aria-pressed]="hasAmenity(a.name)"
                      (click)="toggleAmenity(a.name)"
                    >
                      {{ hasAmenity(a.name) ? '✓ ' : '+ ' }}{{ a.name }} <span class="opacity-60">· {{ a.count }}</span>
                    </button>
                  }
                </div>
              }
              <span class="field-label">Otras características frecuentes</span>
              <div class="flex flex-wrap gap-2">
                @for (a of otherAmenities(); track a) {
                  <button
                    type="button"
                    class="filter-chip"
                    [class.filter-chip-active]="hasAmenity(a)"
                    [class.filter-chip-idle]="!hasAmenity(a)"
                    [attr.aria-pressed]="hasAmenity(a)"
                    (click)="toggleAmenity(a)"
                  >
                    {{ hasAmenity(a) ? '✓ ' : '+ ' }}{{ a }}
                  </button>
                }
              </div>
            </div>
            <label class="md:col-span-2">
              <span class="field-label">Características (una por línea)</span>
              <textarea
                class="field min-h-28"
                name="amenities"
                [(ngModel)]="amenitiesText"
                placeholder="Patio&#10;Garage&#10;Cerca del centro"
              ></textarea>
            </label>
          </section>

          <!-- Datos adicionales y ubicación -->
          <section class="grid gap-5 mer-card p-5 md:grid-cols-3">
            <h2 class="font-display text-lg font-medium text-forest-deep md:col-span-3">Datos adicionales y ubicación</h2>
            <label>
              <span class="field-label">Antigüedad (años)</span>
              <input class="field" type="number" min="0" name="ageYears" [(ngModel)]="draft.ageYears" placeholder="0 = a estrenar" />
            </label>
            <label>
              <span class="field-label">Sucursal que atiende</span>
              <select class="field" name="branch" [(ngModel)]="branchInput">
                <option value="">Según la zona</option>
                @for (b of branches; track b.id) {
                  <option [value]="b.id">{{ b.label }}</option>
                }
              </select>
            </label>

            @if (draft.type === 'campo' || draft.type === 'lote') {
              <label>
                <span class="field-label">Hectáreas</span>
                <input class="field" type="number" min="0" step="any" name="hectares" [(ngModel)]="draft.hectares" />
              </label>
              <label>
                <span class="field-label">Distancia a ruta (km)</span>
                <input class="field" type="number" min="0" step="any" name="routeDistanceKm" [(ngModel)]="draft.routeDistanceKm" />
              </label>
              <label>
                <span class="field-label">Aptitud</span>
                <input class="field" name="aptitude" [(ngModel)]="draft.aptitude" placeholder="Agrícola, ganadera, mixta…" />
              </label>
              <label class="md:col-span-3">
                <span class="field-label">Mejoras</span>
                <input class="field" name="improvements" [(ngModel)]="draft.improvements" placeholder="Aguadas, alambrados, galpón, casa…" />
              </label>
            }

            <label>
              <span class="field-label">Latitud</span>
              <input class="field" type="number" step="any" name="lat" [(ngModel)]="draft.lat" placeholder="-37.4573" />
            </label>
            <label>
              <span class="field-label">Longitud</span>
              <input class="field" type="number" step="any" name="lng" [(ngModel)]="draft.lng" placeholder="-61.9333" />
            </label>
            <label class="flex items-start gap-3 md:pt-6">
              <input type="checkbox" class="mt-1 h-4 w-4" name="mapApprox" [(ngModel)]="draft.mapApprox" />
              <span class="text-sm">Mostrar solo una zona aproximada (no el punto exacto)</span>
            </label>
            <div class="md:col-span-3">
              <p class="mb-2 text-xs text-muted-foreground">
                Tocá el mapa para marcar la ubicación (se completan la latitud y la longitud). También podés escribir las
                coordenadas a mano.
              </p>
              <app-location-picker [lat]="draft.lat" [lng]="draft.lng" (picked)="setLocation($event)" />
            </div>

            <h3 class="font-medium text-forest-deep md:col-span-3">Propietario (solo para uso interno, no se publica)</h3>
            <label class="md:col-span-2">
              <span class="field-label">Nombre</span>
              <input class="field" name="ownerName" [(ngModel)]="draft.ownerName" />
            </label>
            <label>
              <span class="field-label">Teléfono</span>
              <input class="field" name="ownerPhone" [(ngModel)]="draft.ownerPhone" />
            </label>
          </section>

          <!-- Publicación -->
          <section class="grid gap-5 mer-card p-5 md:grid-cols-2">
            <label>
              <span class="field-label">Estado</span>
              <select class="field" name="status" [(ngModel)]="status">
                @for (s of statuses; track s.id) {
                  <option [value]="s.id">{{ s.label }}</option>
                }
              </select>
              <span class="mt-1 block text-xs text-muted-foreground">
                Solo las «Publicadas» se ven en el sitio.
              </span>
            </label>
            @if (auth.can('propiedades.editar.todas')) {
              <label>
                <span class="field-label">Responsable</span>
                <select class="field" name="agentId" [(ngModel)]="agentId">
                  <option value="">Sin asignar</option>
                  @for (u of agents(); track u.id) {
                    <option [value]="u.id">{{ u.name }}</option>
                  }
                </select>
              </label>
            }
            @if (auth.can('propiedades.destacar')) {
            <label class="flex items-start gap-3 md:pt-6">
              <input type="checkbox" class="mt-1 h-4 w-4" name="featured" [(ngModel)]="featured" />
              <span>
                <span class="font-medium text-forest-deep">Mostrar en «Destacadas»</span>
                <span class="block text-xs text-muted-foreground">
                  Hasta {{ maxFeatured }} propiedades en la sección destacada de la home.
                </span>
              </span>
            </label>
            }
          </section>

          <!-- Fotos -->
          <section
            class="mer-card p-5 transition"
            [class.ring-2]="dragging()"
            [class.ring-forest]="dragging()"
            (dragover)="onDragOver($event)"
            (dragleave)="dragging.set(false)"
            (drop)="onDrop($event)"
          >
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 class="font-display text-lg font-medium text-forest-deep">Fotos *</h2>
                <p class="text-xs text-muted-foreground">
                  La primera es la portada. Hasta {{ maxPhotos }} fotos; se achican solas. Podés arrastrarlas acá.
                </p>
              </div>
              <label
                class="inline-flex h-10 cursor-pointer items-center rounded-lg bg-forest-deep px-4 text-sm font-semibold text-stone-warm transition hover:bg-forest hover:text-white"
              >
                {{ uploading() ? 'Subiendo…' : 'Agregar fotos' }}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  class="sr-only"
                  [disabled]="uploading()"
                  (change)="addPhotos($event)"
                />
              </label>
            </div>
            <label class="mt-3 flex items-center gap-2 text-sm">
              <input type="checkbox" class="h-4 w-4" name="watermark" [(ngModel)]="watermark" />
              <span>
                Agregar la marca de agua de la inmobiliaria a las fotos nuevas
                <span class="text-xs text-muted-foreground">(queda dentro de la imagen y no se puede sacar)</span>
              </span>
            </label>
            @if (photoError(); as msg) {
              <p class="mt-3 text-sm text-red-700" role="alert">{{ msg }}</p>
            }
            <ul class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              @for (photo of photos(); track $index; let i = $index; let last = $last) {
                <li class="rounded-lg border border-border p-3">
                  <div class="relative">
                    <img [src]="photo.src | assetUrl" [alt]="photo.alt" class="aspect-[4/3] w-full rounded object-cover" />
                    @if (i === 0) {
                      <span
                        class="absolute top-2 left-2 rounded-full bg-stone-warm px-2 py-0.5 text-[11px] font-semibold text-forest-deep"
                      >
                        Portada
                      </span>
                    }
                  </div>
                  <input
                    class="field mt-3"
                    [name]="'caption-' + i"
                    [ngModel]="photo.caption"
                    (ngModelChange)="setCaption(i, $event)"
                    placeholder="Descripción de la foto"
                    aria-label="Descripción de la foto"
                  />
                  <div class="mt-2 flex gap-2">
                    <button type="button" class="mini-btn" [disabled]="i === 0" (click)="movePhoto(i, -1)" aria-label="Mover antes">←</button>
                    <button type="button" class="mini-btn" [disabled]="last" (click)="movePhoto(i, 1)" aria-label="Mover después">→</button>
                    @if (i !== 0) {
                      <button type="button" class="mini-btn" (click)="makeCover(i)">Portada</button>
                    }
                    <button type="button" class="mini-btn ml-auto text-red-700" (click)="removePhoto(i)">Quitar</button>
                  </div>
                </li>
              } @empty {
                <li class="text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">Todavía no hay fotos.</li>
              }
            </ul>
          </section>

          </fieldset>

          <!-- Calidad del aviso -->
          @if (!readonly()) {
            <section class="mer-card p-5">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <h2 class="font-display text-lg font-medium text-forest-deep">Calidad del aviso</h2>
                <p class="text-sm">
                  <span class="text-2xl font-semibold tabular-nums text-forest-deep">{{ quality().score }}</span>
                  <span class="text-muted-foreground">/100 · {{ quality().levelLabel }}</span>
                </p>
              </div>
              <div class="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  class="h-full rounded-full transition-all"
                  [class]="quality().level === 'muy-bueno' ? 'bg-green-600' : quality().level === 'bueno' ? 'bg-stone-warm' : 'bg-red-500'"
                  [style.width.%]="quality().score"
                ></div>
              </div>
              <ul class="mt-4 grid gap-x-6 gap-y-1.5 text-sm md:grid-cols-2">
                @for (c of quality().checks; track c.id) {
                  <li class="flex gap-2">
                    <span [class]="c.points === c.max ? 'text-green-700' : 'text-muted-foreground'" aria-hidden="true">
                      {{ c.points === c.max ? '✓' : '○' }}
                    </span>
                    <span>
                      <span class="font-medium">{{ c.label }}</span>
                      <span class="text-muted-foreground"> {{ c.points }}/{{ c.max }}</span>
                      @if (c.hint) {
                        <span class="block text-xs text-muted-foreground">{{ c.hint }}</span>
                      }
                    </span>
                  </li>
                }
              </ul>
            </section>
          }

          <!-- Asistente de redacción -->
          @if (!readonly()) {
            <section class="mer-card p-5">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 class="font-display text-lg font-medium text-forest-deep">Asistente de redacción</h2>
                  <p class="text-xs text-muted-foreground">
                    Mira las fotos y los datos y arma los textos para el sitio, Instagram, Facebook, Mercado Libre y WhatsApp.
                  </p>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <select
                    class="h-10 rounded-lg border border-border bg-background px-2 text-sm"
                    name="tone"
                    [(ngModel)]="tone"
                    aria-label="Tono del texto"
                  >
                    @for (t of tones; track t.id) {
                      <option [value]="t.id">Tono {{ t.label.toLowerCase() }}</option>
                    }
                  </select>
                  <button
                    type="button"
                    class="h-10 rounded-lg bg-forest-deep px-4 text-sm font-semibold text-stone-warm transition hover:bg-forest hover:text-white disabled:opacity-60"
                    [disabled]="assistantBusy()"
                    (click)="generate()"
                  >
                    {{ assistantBusy() ? 'Redactando…' : copy() ? 'Volver a generar' : 'Redactar con IA' }}
                  </button>
                </div>
              </div>

              @if (assistantError(); as msg) {
                <p class="mt-3 text-sm text-red-700" role="alert">{{ msg }}</p>
              }

              @if (copy(); as c) {
                <p class="mt-4 text-xs text-muted-foreground">
                  @if (c.source === 'ia') {
                    <span class="rounded-full bg-forest/15 px-2 py-0.5 font-semibold text-forest-deep">Generado por IA</span>
                    · miró {{ c.photosUsed }} {{ c.photosUsed === 1 ? 'foto' : 'fotos' }}. Revisalo antes de publicar.
                  } @else {
                    <span class="rounded-full bg-muted px-2 py-0.5 font-semibold">Plantilla</span>
                    · el servidor de IA no está disponible, así que armé el texto con los datos cargados (no mira las fotos).
                  }
                </p>

                @if (c.sugerencias.length > 0) {
                  <div class="mt-4 rounded-lg border border-stone-warm/50 bg-stone-warm/15 p-4">
                    <p class="text-sm font-semibold text-forest-deep">Para mejorar el aviso</p>
                    <ul class="mt-1 list-disc space-y-0.5 pl-5 text-sm">
                      @for (s of c.sugerencias; track s) {
                        <li>{{ s }}</li>
                      }
                    </ul>
                  </div>
                }

                <div class="mt-5 flex flex-wrap gap-1.5" role="tablist">
                  @for (tab of tabs; track tab.id) {
                    <button
                      type="button"
                      role="tab"
                      class="filter-chip"
                      [class.filter-chip-active]="activeTab() === tab.id"
                      [class.filter-chip-idle]="activeTab() !== tab.id"
                      [attr.aria-selected]="activeTab() === tab.id"
                      (click)="activeTab.set(tab.id)"
                    >
                      {{ tab.label }}
                    </button>
                  }
                </div>

                <div class="mt-4">
                  @if (activeTab() === 'sitio') {
                    <p class="text-sm font-semibold text-forest-deep">{{ c.titulo }}</p>
                    <p class="mt-2 whitespace-pre-line text-sm leading-relaxed">{{ c.descripcion }}</p>
                    @if (c.caracteristicas.length > 0) {
                      <ul class="mt-3 flex flex-wrap gap-2">
                        @for (item of c.caracteristicas; track item) {
                          <li class="rounded-full border border-border px-3 py-1 text-xs">{{ item }}</li>
                        }
                      </ul>
                    }
                    <div class="mt-4 flex flex-wrap gap-2">
                      <button type="button" class="mini-btn" (click)="applyToForm(c)">Usar en el formulario</button>
                      <button type="button" class="mini-btn" (click)="copyText(c.descripcion)">Copiar descripción</button>
                    </div>
                  } @else {
                    @if (activeTab() === 'mercadolibre') {
                      <p class="text-sm font-semibold text-forest-deep">
                        {{ c.mercadolibre_titulo }}
                        <span class="ml-1 text-xs font-normal text-muted-foreground">({{ c.mercadolibre_titulo.length }}/60)</span>
                      </p>
                    }
                    <p class="mt-2 whitespace-pre-line text-sm leading-relaxed">{{ textFor(c) }}</p>
                    <div class="mt-4">
                      <button type="button" class="mini-btn" (click)="copyText(textFor(c))">
                        {{ copiedTab() === activeTab() ? '¡Copiado!' : 'Copiar texto' }}
                      </button>
                    </div>
                  }
                </div>
              }
            </section>
          }

          <!-- Vista previa -->
          @if (preview(); as card) {
            <section class="mer-card p-5">
              <h2 class="font-display text-lg font-medium text-forest-deep">Así se ve en el sitio</h2>
              <p class="text-xs text-muted-foreground">Vista previa de la tarjeta con los datos actuales del formulario.</p>
              <div class="mt-4 max-w-sm">
                <app-property-card [property]="card" [showFavorite]="false" />
              </div>
            </section>
          }

          <!-- Historial -->
          @if (!isNew() && history().length > 0) {
            <section class="mer-card p-5">
              <h2 class="font-display text-lg font-medium text-forest-deep">Historial de la propiedad</h2>
              <ol class="mt-4 space-y-3 border-l-2 border-border pl-4">
                @for (entry of history(); track entry.at + entry.action) {
                  <li>
                    <p class="text-xs text-muted-foreground">{{ entry.at | date: 'dd/MM/yyyy HH:mm' }} · {{ entry.user }}</p>
                    <p class="text-sm">{{ entry.action }}</p>
                  </li>
                }
              </ol>
            </section>
          }

          @if (store.storageError(); as error) {
            <p class="text-sm text-red-700" role="alert">{{ error }}</p>
          }

          <div class="flex flex-wrap gap-3">
            @if (!readonly()) {
              <button
                type="submit"
                class="h-11 rounded-lg bg-forest-deep px-6 text-sm font-semibold text-stone-warm transition hover:bg-forest hover:text-white"
              >
                Guardar
              </button>
            }
            <a
              routerLink="/panel/propiedades"
              class="inline-flex h-11 items-center rounded-lg border border-border bg-background px-6 text-sm font-medium transition hover:border-forest"
            >
              {{ readonly() ? 'Volver' : 'Cancelar' }}
            </a>
          </div>
        </form>
      }
    </app-panel-shell>
  `,
  styles: [
    `
      .field-label {
        display: block;
        margin-bottom: 0.375rem;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #6a5748;
      }
      .field {
        width: 100%;
        min-height: 2.75rem;
        border: 1px solid #e5d9cb;
        border-radius: 0.5rem;
        background: #faf7f2;
        padding: 0.5rem 0.875rem;
        font-size: 0.875rem;
        outline: none;
      }
      .field:focus {
        border-color: #d06a28;
        box-shadow: 0 0 0 2px rgb(208 106 40 / 0.2);
      }
      .mini-btn {
        height: 2rem;
        border: 1px solid #e5d9cb;
        border-radius: 0.375rem;
        padding: 0 0.625rem;
        font-size: 0.75rem;
        font-weight: 500;
      }
      .mini-btn:disabled {
        opacity: 0.3;
      }
    `,
  ],
})
export class PanelFormComponent {
  protected readonly toast = inject(ToastService);
  readonly store = inject(PropertyStore);
  readonly auth = inject(AuthService);
  private readonly activity = inject(ActivityLog);
  private readonly usersStore = inject(UsersStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly maxFeatured = MAX_FEATURED;
  readonly maxPhotos = MAX_PHOTOS;
  readonly branches = (Object.keys(BRANCH_LABELS) as PropertyBranch[]).map((id) => ({ id, label: BRANCH_LABELS[id] }));
  branchInput = '';
  readonly types: PropertyType[] = ['casa', 'departamento', 'campo', 'lote', 'local'];
  readonly statuses = (Object.keys(STATUS_LABELS) as PropertyStatus[]).map((id) => ({
    id,
    label: STATUS_LABELS[id],
  }));

  private readonly id = this.route.snapshot.paramMap.get('id') ?? 'nueva';
  readonly isNew = signal(this.id === 'nueva');
  readonly notFound = signal(false);
  readonly errors = signal<string[]>([]);
  readonly photos = signal<PropertyPhoto[]>([]);
  readonly photoError = signal<string | null>(null);
  readonly uploading = signal(false);
  /** Agregar la marca de agua de la inmobiliaria a las fotos nuevas. */
  watermark = true;

  private readonly ai = inject(AiCopyService);
  private readonly location = inject(Location);
  private snapshot = '';
  private saved = false;

  readonly tones = (Object.keys(TONE_LABELS) as AiTone[]).map((id) => ({ id, label: TONE_LABELS[id] }));
  readonly tabs = [
    { id: 'sitio', label: 'Sitio' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'facebook', label: 'Facebook' },
    { id: 'mercadolibre', label: 'Mercado Libre' },
    { id: 'whatsapp', label: 'WhatsApp' },
  ] as const;
  tone: AiTone = 'profesional';
  readonly copy = signal<CopyPackage | null>(null);
  readonly assistantBusy = signal(false);
  readonly assistantError = signal<string | null>(null);
  readonly activeTab = signal<'sitio' | 'instagram' | 'facebook' | 'mercadolibre' | 'whatsapp'>('sitio');
  readonly copiedTab = signal<string | null>(null);

  draft: Property = this.blank();
  zoneInput = '';
  amenitiesText = '';
  beds: number | null = null;
  baths: number | null = null;
  status: PropertyStatus = 'publicada';
  featured = false;
  agentId = '';

  /** Quienes pueden ser responsables de una propiedad. */
  readonly agents = computed(() =>
    this.usersStore.all().filter((u) => u.active && (u.role === 'titular' || u.role === 'agente'))
  );

  /** Cambios de esta propiedad, del más nuevo al más viejo. */
  readonly history = computed(() => this.activity.entries().filter((e) => e.ref === this.id).slice(0, 15));

  /** Falta permiso para crear (solo aplica a «nueva»). */
  readonly allowed = computed(() => !this.isNew() || this.auth.can('propiedades.crear'));

  /** Solo lectura: existe y el usuario no la puede editar. */
  readonly readonly = computed(() => !this.isNew() && !this.notFound() && !this.canEditCurrent());
  private readonly canEditCurrent = signal(true);

  private readonly zonesStore = inject(ZonesStore);
  readonly zoneNames = computed(() => this.zonesStore.options().map((z) => z.name));
  readonly addingZone = signal(false);
  /** Valor del desplegable: el nombre de la zona, o «__nueva» mientras se escribe una. */
  readonly zoneChoice = computed(() => {
    if (this.addingZone()) return '__nueva';
    const current = this.zoneInputSignal().trim().toLowerCase();
    return this.zoneNames().find((n) => n.toLowerCase() === current) ?? (current ? '__nueva' : '');
  });
  private readonly zoneInputSignal = signal('');

  chooseZone(value: string) {
    if (value === '__nueva') {
      this.addingZone.set(true);
      this.zoneInput = '';
      this.zoneInputSignal.set('');
      return;
    }
    this.addingZone.set(false);
    this.zoneInput = value;
    this.zoneInputSignal.set(value);
  }

  constructor() {
    if (!this.isNew()) {
      const found = this.store.getById(this.id);
      if (!found) {
        this.notFound.set(true);
        return;
      }
      this.draft = { ...found };
      this.zoneInput = labelForZone(found.zone);
      this.zoneInputSignal.set(this.zoneInput);
      this.amenitiesText = found.amenities.join('\n');
      this.beds = found.beds ?? null;
      this.baths = found.baths ?? null;
      this.status = this.store.statusOf(found);
      this.featured = !!found.featured;
      this.photos.set(found.photos.map((p) => ({ ...p })));
      this.agentId = found.agentId ?? '';
      this.branchInput = found.branch ?? '';
      this.canEditCurrent.set(this.auth.canEdit(found));
    } else {
      this.agentId = this.auth.user()?.id ?? '';
      this.restoreDraft();
    }
    this.snapshot = this.currentState();
    if (this.isNew()) {
      const timer = setInterval(() => this.saveDraft(), 4000);
      inject(DestroyRef).onDestroy(() => clearInterval(timer));
    }
  }

  readonly steppers = [
    { key: 'beds', label: 'Dormitorios' },
    { key: 'baths', label: 'Baños' },
    { key: 'garages', label: 'Cocheras' },
  ] as const;

  readonly quickAmenities = [
    'Pileta', 'Parrilla', 'Quincho', 'Patio', 'Jardín', 'Balcón', 'Terraza', 'Aire acondicionado', 'Calefacción',
    'Gas natural', 'Agua corriente', 'Cloacas', 'Luz', 'Amoblado', 'Apto crédito', 'Escritura', 'Cochera cubierta',
    'Seguridad', 'Ascensor', 'Lavadero',
  ];

  /** Las características que se repiten en al menos dos propiedades cargadas (hasta 8). */
  readonly popularAmenities = computed(() => {
    const counts = new Map<string, { name: string; count: number }>();
    for (const p of this.store.all()) {
      for (const raw of new Set(p.amenities.map((a) => a.trim()).filter(Boolean))) {
        const key = raw.toLowerCase();
        const entry = counts.get(key);
        if (entry) entry.count++;
        else counts.set(key, { name: raw, count: 1 });
      }
    }
    return [...counts.values()]
      .filter((a) => a.count >= 2 && a.name.length <= 28)
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'es'))
      .slice(0, 8);
  });

  /** Las sugeridas de siempre, sin repetir las que ya salen entre las más usadas. */
  readonly otherAmenities = computed(() => {
    const popular = new Set(this.popularAmenities().map((a) => a.name.toLowerCase()));
    return this.quickAmenities.filter((a) => !popular.has(a.toLowerCase()));
  });

  stepValue(key: 'beds' | 'baths' | 'garages'): number | null {
    return key === 'garages' ? (this.draft.garages ?? null) : this[key];
  }

  /** Suma o resta uno; al bajar de 0 queda «sin dato». */
  step(key: 'beds' | 'baths' | 'garages', delta: 1 | -1) {
    const current = this.stepValue(key);
    const next = current === null ? (delta === 1 ? 1 : null) : current + delta < 0 ? null : current + delta;
    if (key === 'garages') this.draft.garages = next ?? undefined;
    else this[key] = next;
  }

  private amenityLines(): string[] {
    return this.amenitiesText.split('\n').map((l) => l.trim()).filter(Boolean);
  }

  hasAmenity(name: string): boolean {
    return this.amenityLines().some((l) => l.toLowerCase() === name.toLowerCase());
  }

  toggleAmenity(name: string) {
    const lines = this.amenityLines();
    this.amenitiesText = this.hasAmenity(name)
      ? lines.filter((l) => l.toLowerCase() !== name.toLowerCase()).join('\n')
      : [...lines, name].join('\n');
  }

  private static readonly DRAFT_KEY = 'mer.panel.draft.new';

  /** Guarda los textos de la propiedad nueva (sin fotos) para no perderlos si se cierra la pestaña. */
  private saveDraft() {
    if (this.saved || !this.isNew()) return;
    const d = this.draft;
    const empty = !d.title.trim() && !d.location.trim() && !d.priceLabel.trim() && !d.description.trim();
    try {
      if (empty) {
        localStorage.removeItem(PanelFormComponent.DRAFT_KEY);
        return;
      }
      localStorage.setItem(
        PanelFormComponent.DRAFT_KEY,
        JSON.stringify({
          draft: d,
          zoneInput: this.zoneInput,
          amenitiesText: this.amenitiesText,
          beds: this.beds,
          baths: this.baths,
          status: this.status,
        })
      );
    } catch {
      /* sin espacio: no se guarda el borrador */
    }
  }

  private restoreDraft() {
    try {
      const raw = localStorage.getItem(PanelFormComponent.DRAFT_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      this.draft = { ...this.draft, ...saved.draft };
      this.zoneInput = saved.zoneInput ?? '';
      this.zoneInputSignal.set(this.zoneInput);
      this.amenitiesText = saved.amenitiesText ?? '';
      this.beds = saved.beds ?? null;
      this.baths = saved.baths ?? null;
      this.status = saved.status ?? this.status;
      setTimeout(() => this.toast.show('Recuperamos el borrador que tenías sin guardar. Las fotos hay que volver a cargarlas.'), 0);
    } catch {
      /* borrador ilegible: se ignora */
    }
  }

  private clearDraft() {
    try {
      localStorage.removeItem(PanelFormComponent.DRAFT_KEY);
    } catch {
      /* nada */
    }
  }

  setLocation(point: { lat: number; lng: number }) {
    this.draft.lat = point.lat;
    this.draft.lng = point.lng;
  }

  /** Calidad del aviso con lo que hay cargado ahora en el formulario. */
  quality() {
    const d = this.draft;
    return listingQuality({
      ...d,
      beds: this.beds ?? undefined,
      baths: this.baths ?? undefined,
      amenities: this.amenitiesText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      photos: this.photos(),
    });
  }

  /** Tarjeta con lo que hay en el formulario ahora (solo si ya hay al menos una foto). */
  preview(): Property | null {
    const photos = this.photos();
    if (photos.length === 0) return null;
    return {
      ...this.draft,
      title: this.draft.title.trim() || 'Título de la propiedad',
      location: this.draft.location.trim() || 'Ubicación',
      priceLabel: this.draft.priceLabel.trim() || 'Consultar',
      areaLabel: this.draft.areaLabel.trim() || '— m²',
      beds: this.beds ?? undefined,
      baths: this.baths ?? undefined,
      photos,
      featured: this.featured,
    };
  }

  private currentState(): string {
    return JSON.stringify([
      this.draft.title,
      this.draft.operation,
      this.draft.type,
      this.draft.location,
      this.draft.priceLabel,
      this.draft.areaLabel,
      this.draft.highlight,
      this.draft.description,
      this.zoneInput,
      this.amenitiesText,
      this.beds,
      this.baths,
      this.status,
      this.featured,
      this.agentId,
      this.photos().map((p) => [p.src.length, p.caption]),
    ]);
  }

  /** Hay cambios sin guardar (se usa para avisar antes de salir). */
  hasUnsavedChanges(): boolean {
    if (this.saved || this.notFound() || this.readonly()) return false;
    return this.currentState() !== this.snapshot;
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent) {
    if (this.hasUnsavedChanges()) {
      event.preventDefault();
    }
  }

  private blank(): Property {
    return {
      id: '',
      slug: '',
      title: '',
      location: '',
      zone: '',
      operation: 'venta' as PropertyOperation,
      type: 'casa',
      priceLabel: '',
      areaLabel: '',
      description: '',
      amenities: [],
      photos: [],
    };
  }

  async addPhotos(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    await this.uploadFiles(files);
  }

  readonly dragging = signal(false);

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragging.set(true);
  }

  async onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragging.set(false);
    const files = Array.from(event.dataTransfer?.files ?? []).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) {
      this.toast.error('Soltá archivos de imagen (JPG, PNG o WebP).');
      return;
    }
    await this.uploadFiles(files);
  }

  private async uploadFiles(files: File[]) {
    if (files.length === 0) return;
    this.photoError.set(null);
    const room = MAX_PHOTOS - this.photos().length;
    if (room <= 0) {
      this.photoError.set(`Ya hay ${MAX_PHOTOS} fotos. Quitá alguna para agregar otra.`);
      this.toast.error(`Ya hay ${MAX_PHOTOS} fotos. Quitá alguna para agregar otra.`);
      return;
    }
    this.uploading.set(true);
    const added: PropertyPhoto[] = [];
    let failed = 0;
    for (const file of files.slice(0, room)) {
      try {
        const src = await compressImage(file, this.watermark);
        const caption = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
        added.push({ src, alt: caption, caption, watermarked: this.watermark });
      } catch {
        failed++;
      }
    }
    this.photos.update((list) => [...list, ...added]);
    this.uploading.set(false);
    if (added.length > 0) this.toast.success(`${added.length} ${added.length === 1 ? 'foto agregada' : 'fotos agregadas'}.`);
    if (failed > 0) this.toast.error(`${failed} archivo(s) no se pudieron leer como imagen.`);
    const messages: string[] = [];
    if (files.length > room) messages.push(`Solo entraron ${room} de ${files.length} fotos (máximo ${MAX_PHOTOS}).`);
    if (failed > 0) messages.push(`${failed} archivo(s) no se pudieron leer como imagen.`);
    if (messages.length > 0) this.photoError.set(messages.join(' '));
  }

  /** Convierte una foto (ruta del sitio o data URL) en data URL chica para mandarla a la IA. */
  private async photoForAi(photo: PropertyPhoto): Promise<string | null> {
    try {
      if (photo.src.startsWith('data:')) return photo.src;
      const url = resolveAssetUrl(photo.src, (u) => this.location.prepareExternalUrl(u));
      const blob = await (await fetch(url)).blob();
      return await compressImage(new File([blob], 'foto.jpg', { type: blob.type || 'image/jpeg' }));
    } catch {
      return null;
    }
  }

  async generate() {
    this.assistantError.set(null);
    const d = this.draft;
    if (!this.zoneInput.trim() && !d.location.trim()) {
      this.assistantError.set('Completá al menos la ubicación o la zona para que pueda redactar.');
      return;
    }
    this.assistantBusy.set(true);
    const sent = this.photos().slice(0, 6);
    const converted = await Promise.all(sent.map((p) => this.photoForAi(p)));
    const photos = sent.flatMap((p, i) => {
      const dataUrl = converted[i];
      return dataUrl ? [{ dataUrl, caption: p.caption }] : [];
    });
    const result = await this.ai.generate({
      tone: this.tone,
      property: {
        operation: d.operation,
        type: d.type,
        zone: this.zoneInput.trim(),
        location: d.location.trim(),
        priceLabel: d.priceLabel.trim(),
        areaLabel: d.areaLabel.trim(),
        beds: this.beds ?? undefined,
        baths: this.baths ?? undefined,
        highlight: d.highlight?.trim() || undefined,
        amenities: this.amenitiesText
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean),
        description: d.description.trim() || undefined,
      },
      photos,
    });
    this.copy.set(result);
    this.activeTab.set('sitio');
    this.assistantBusy.set(false);
  }

  applyToForm(c: CopyPackage) {
    this.draft.title = c.titulo;
    this.draft.description = c.descripcion;
    if (c.caracteristicas.length > 0) {
      this.amenitiesText = c.caracteristicas.join('\n');
    }
  }

  textFor(c: CopyPackage): string {
    switch (this.activeTab()) {
      case 'instagram':
        return c.instagram;
      case 'facebook':
        return c.facebook;
      case 'mercadolibre':
        return c.mercadolibre_descripcion;
      case 'whatsapp':
        return c.whatsapp;
      default:
        return c.descripcion;
    }
  }

  async copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      this.copiedTab.set(this.activeTab());
      this.toast.success('Texto copiado.');
      setTimeout(() => this.copiedTab.set(null), 1800);
    } catch {
      this.assistantError.set('No se pudo copiar automáticamente: seleccioná el texto y copialo a mano.');
      this.toast.error('No se pudo copiar. Seleccioná el texto y copialo a mano.');
    }
  }

  setCaption(index: number, caption: string) {
    this.photos.update((list) =>
      list.map((p, i) => (i === index ? { ...p, caption, alt: caption || p.alt } : p))
    );
  }

  movePhoto(index: number, direction: -1 | 1) {
    this.photos.update((list) => {
      const target = index + direction;
      if (target < 0 || target >= list.length) return list;
      const next = [...list];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  makeCover(index: number) {
    this.photos.update((list) => {
      const next = [...list];
      const [cover] = next.splice(index, 1);
      return [cover, ...next];
    });
  }

  removePhoto(index: number) {
    this.photos.update((list) => list.filter((_, i) => i !== index));
    this.toast.success('Foto quitada.');
  }

  save(event: Event) {
    event.preventDefault();
    if (this.readonly()) return;
    const d = this.draft;
    const problems: string[] = [];
    if (!d.title.trim()) problems.push('Falta el título.');
    if (!this.zoneInput.trim()) problems.push('Falta la zona.');
    if (!d.location.trim()) problems.push('Falta la ubicación.');
    if (!d.priceLabel.trim()) problems.push('Falta el precio (podés poner «Consultar»).');
    if (!d.areaLabel.trim()) problems.push('Falta la superficie.');
    if (!d.description.trim()) problems.push('Falta la descripción.');
    if (this.photos().length === 0) problems.push('Subí al menos una foto.');
    const hasLat = this.draft.lat != null;
    const hasLng = this.draft.lng != null;
    if (hasLat !== hasLng) problems.push('Cargá la latitud y la longitud juntas, o dejá las dos vacías.');
    if (hasLat && hasLng && !(Math.abs(this.draft.lat!) <= 90 && Math.abs(this.draft.lng!) <= 180)) {
      problems.push('Las coordenadas no son válidas (latitud entre -90 y 90, longitud entre -180 y 180).');
    }
    if (this.featured && !this.draft.featured && this.store.featuredAll().length >= MAX_FEATURED) {
      problems.push(`Ya hay ${MAX_FEATURED} propiedades destacadas. Sacá una antes de destacar otra.`);
    }
    this.errors.set(problems);
    if (problems.length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const id = this.isNew() ? this.store.newId() : this.draft.id;
    const zoneLabel = this.zoneInput.trim();
    const known = Object.entries(ZONE_LABELS).find(
      ([, label]) => label.toLowerCase() === zoneLabel.toLowerCase()
    );
    const zone = known ? known[0] : slugify(zoneLabel);
    if (!known) this.zonesStore.add(zoneLabel);

    const nextOrder =
      Math.max(0, ...this.store.featuredAll().map((p) => p.featuredOrder ?? 0)) + 1;
    const wasFeatured = !!this.draft.featured;

    const property: Property = {
      ...this.draft,
      id,
      slug: this.isNew() || !this.draft.slug ? this.store.uniqueSlug(d.title, id) : this.draft.slug,
      title: d.title.trim(),
      location: d.location.trim(),
      zone,
      priceLabel: d.priceLabel.trim(),
      areaLabel: d.areaLabel.trim(),
      description: d.description.trim(),
      highlight: d.highlight?.trim() || undefined,
      beds: this.beds ?? undefined,
      baths: this.baths ?? undefined,
      amenities: this.amenitiesText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      photos: this.photos(),
      status: this.status,
      agentId: this.agentId || undefined,
      branch: (this.branchInput || undefined) as PropertyBranch | undefined,
      ageYears: this.draft.ageYears ?? undefined,
      garages: this.draft.garages ?? undefined,
      hectares: this.draft.hectares ?? undefined,
      routeDistanceKm: this.draft.routeDistanceKm ?? undefined,
      aptitude: this.draft.aptitude?.trim() || undefined,
      improvements: this.draft.improvements?.trim() || undefined,
      lat: this.draft.lat ?? undefined,
      lng: this.draft.lng ?? undefined,
      mapApprox: this.draft.lat != null && this.draft.lng != null ? !!this.draft.mapApprox : undefined,
      ownerName: this.draft.ownerName?.trim() || undefined,
      ownerPhone: this.draft.ownerPhone?.trim() || undefined,
      featured: this.featured,
      featuredOrder: this.featured ? (wasFeatured ? this.draft.featuredOrder : nextOrder) : undefined,
    };

    if (this.store.upsert(property)) {
      this.saved = true;
      this.clearDraft();
      this.toast.success('Propiedad guardada.');
      void this.router.navigate(['/panel/propiedades']);
    }
  }
}
