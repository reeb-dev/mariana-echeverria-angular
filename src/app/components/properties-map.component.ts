import { Location } from '@angular/common';
import { Component, ElementRef, OnDestroy, effect, inject, input, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { type Property } from '../data/properties';
import { DEFAULT_CENTER, hasGoogleMaps, loadGoogleMaps } from '../utils/google-maps';

const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';

/** Color de la marca: venta en terracota y alquiler en espresso. */
function pinColor(p: Property): string {
  return p.operation === 'alquiler' ? '#1c1612' : '#d06a28';
}

/**
 * Mapa con una marca por propiedad (las que tienen ubicación cargada).
 * Usa Google Maps si hay clave configurada (`config/maps.config.ts`) y OpenStreetMap si no.
 */
@Component({
  selector: 'app-properties-map',
  standalone: true,
  template: `
    <div class="relative h-full w-full">
      <div #host class="h-full w-full rounded-xl" role="region" aria-label="Mapa de propiedades"></div>
      @if (error(); as message) {
        <p class="absolute inset-x-3 top-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 shadow-soft" role="alert">
          {{ message }}
        </p>
      }
    </div>
  `,
})
export class PropertiesMapComponent implements OnDestroy {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly host = viewChild.required<ElementRef<HTMLDivElement>>('host');

  readonly properties = input.required<Property[]>();
  /** En el panel, el enlace de cada marca abre la edición y no la ficha pública. */
  readonly target = input<'public' | 'panel'>('public');
  readonly error = signal<string | null>(null);

  private destroyed = false;

  // OpenStreetMap (Leaflet)
  private leafletMap: L.Map | null = null;
  private leafletLayer: L.LayerGroup | null = null;

  // Google Maps
  private gMap: google.maps.Map | null = null;
  private gMarkers: google.maps.marker.AdvancedMarkerElement[] = [];
  private gInfo: google.maps.InfoWindow | null = null;

  constructor() {
    effect(() => {
      const items = this.properties();
      const el = this.host().nativeElement;
      if (hasGoogleMaps) {
        void this.renderGoogle(el, items);
      } else {
        this.renderLeaflet(el, items);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.leafletMap?.remove();
    this.leafletMap = null;
    this.gMarkers.forEach((m) => (m.map = null));
    this.gMarkers = [];
  }

  /* ----------------------------------------------------------------- Google Maps */

  private async renderGoogle(el: HTMLElement, items: Property[]): Promise<void> {
    try {
      await loadGoogleMaps();
      const { Map, InfoWindow } = (await google.maps.importLibrary('maps')) as google.maps.MapsLibrary;
      const { AdvancedMarkerElement } = (await google.maps.importLibrary('marker')) as google.maps.MarkerLibrary;
      if (this.destroyed) return;
      this.error.set(null);

      if (!this.gMap) {
        this.gMap = new Map(el, {
          center: DEFAULT_CENTER,
          zoom: 6,
          // DEMO_MAP_ID permite usar marcadores avanzados sin crear un estilo en Google Cloud.
          mapId: 'DEMO_MAP_ID',
          gestureHandling: 'cooperative',
          streetViewControl: false,
          mapTypeControl: false,
        });
        this.gInfo = new InfoWindow();
      }

      this.gMarkers.forEach((m) => (m.map = null));
      this.gMarkers = [];
      const bounds = new google.maps.LatLngBounds();
      let count = 0;

      for (const p of items) {
        if (p.lat == null || p.lng == null) continue;
        const position = { lat: p.lat, lng: p.lng };
        const marker = new AdvancedMarkerElement({
          map: this.gMap,
          position,
          title: p.title,
          content: this.pinElement(p),
        });
        marker.addListener('click', () => {
          this.gInfo?.setContent(this.popupFor(p));
          this.gInfo?.open({ map: this.gMap!, anchor: marker });
        });
        this.gMarkers.push(marker);
        bounds.extend(position);
        count++;
      }

      if (count === 1) {
        this.gMap.setCenter(bounds.getCenter());
        this.gMap.setZoom(13);
      } else if (count > 1) {
        this.gMap.fitBounds(bounds, 48);
      }
    } catch {
      if (!this.destroyed) {
        this.error.set('No se pudo cargar Google Maps. Revisá la clave y sus restricciones.');
      }
    }
  }

  private pinElement(p: Property): HTMLElement {
    const pin = document.createElement('span');
    pin.style.cssText = `display:block;width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${pinColor(
      p
    )};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);margin-bottom:6px`;
    return pin;
  }

  /* --------------------------------------------------------------- OpenStreetMap */

  private renderLeaflet(el: HTMLElement, items: Property[]): void {
    if (!this.leafletMap) {
      this.leafletMap = L.map(el, { scrollWheelZoom: false }).setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], 6);
      L.tileLayer(OSM_TILE_URL, { maxZoom: 18, attribution: OSM_ATTRIBUTION }).addTo(this.leafletMap);
      this.leafletLayer = L.layerGroup().addTo(this.leafletMap);
    }
    const layer = this.leafletLayer!;
    layer.clearLayers();
    const points: L.LatLngTuple[] = [];

    for (const p of items) {
      if (p.lat == null || p.lng == null) continue;
      const latlng: L.LatLngTuple = [p.lat, p.lng];
      points.push(latlng);
      const icon = L.divIcon({
        className: '',
        html: `<span style="display:block;width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${pinColor(
          p
        )};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></span>`,
        iconSize: [26, 26],
        iconAnchor: [13, 26],
        popupAnchor: [0, -24],
      });
      L.marker(latlng, { icon, title: p.title, keyboard: true }).addTo(layer).bindPopup(this.popupFor(p));
    }

    if (points.length === 1) {
      this.leafletMap.setView(points[0], 13);
    } else if (points.length > 1) {
      this.leafletMap.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 14 });
    }
    setTimeout(() => this.leafletMap?.invalidateSize(), 0);
  }

  /* ----------------------------------------------------------------------- Común */

  /** Se arma con nodos del DOM (y no con HTML) para que un título raro no inyecte nada. */
  private popupFor(p: Property): HTMLElement {
    const box = document.createElement('div');
    box.style.cssText = 'min-width:170px;font-family:inherit';

    const kind = document.createElement('div');
    kind.textContent = `${p.operation} · ${p.type}`;
    kind.style.cssText = 'font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#d06a28;font-weight:600';
    box.appendChild(kind);

    const title = document.createElement('div');
    title.textContent = p.title;
    title.style.cssText = 'font-weight:600;margin:2px 0';
    box.appendChild(title);

    const price = document.createElement('div');
    price.textContent = p.priceLabel;
    price.style.cssText = 'font-size:13px;margin-bottom:6px';
    box.appendChild(price);

    if (p.mapApprox) {
      const note = document.createElement('div');
      note.textContent = 'Ubicación aproximada';
      note.style.cssText = 'font-size:11px;color:#6a5748;margin-bottom:6px';
      box.appendChild(note);
    }

    const link = document.createElement('a');
    const path = this.target() === 'panel' ? `/panel/propiedad/${p.id}` : `/propiedades/${p.slug}`;
    link.href = this.location.prepareExternalUrl(path);
    link.textContent = this.target() === 'panel' ? 'Editar' : 'Ver ficha';
    link.style.cssText = 'color:#d06a28;font-weight:600;text-decoration:underline';
    link.addEventListener('click', (event) => {
      event.preventDefault();
      void this.router.navigateByUrl(path);
    });
    box.appendChild(link);
    return box;
  }
}
