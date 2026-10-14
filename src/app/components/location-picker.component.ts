import { Component, ElementRef, OnDestroy, effect, input, output, signal, viewChild } from '@angular/core';
import * as L from 'leaflet';
import { DEFAULT_CENTER, hasGoogleMaps, loadGoogleMaps } from '../utils/google-maps';

const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

/** Mapa donde se toca para elegir la ubicación de una propiedad (Google Maps si hay clave, si no OpenStreetMap). */
@Component({
  selector: 'app-location-picker',
  standalone: true,
  template: `
    <div class="relative">
      <div #host class="h-72 w-full rounded-xl border border-border" role="application" aria-label="Elegir ubicación en el mapa"></div>
      @if (error(); as message) {
        <p class="absolute inset-x-3 top-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 shadow-soft" role="alert">
          {{ message }}
        </p>
      }
    </div>
  `,
})
export class LocationPickerComponent implements OnDestroy {
  private readonly host = viewChild.required<ElementRef<HTMLDivElement>>('host');

  readonly lat = input<number | null | undefined>(null);
  readonly lng = input<number | null | undefined>(null);
  readonly picked = output<{ lat: number; lng: number }>();
  readonly error = signal<string | null>(null);

  private destroyed = false;

  private leafletMap: L.Map | null = null;
  private leafletMarker: L.Marker | null = null;

  private gMap: google.maps.Map | null = null;
  private gMarker: google.maps.marker.AdvancedMarkerElement | null = null;

  constructor() {
    effect(() => {
      const el = this.host().nativeElement;
      const lat = this.lat();
      const lng = this.lng();
      const has = lat != null && lng != null && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
      if (hasGoogleMaps) {
        void this.syncGoogle(el, has ? { lat: lat!, lng: lng! } : null);
      } else {
        this.syncLeaflet(el, has ? { lat: lat!, lng: lng! } : null);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.leafletMap?.remove();
    this.leafletMap = null;
    if (this.gMarker) this.gMarker.map = null;
  }

  private emit(lat: number, lng: number): void {
    this.picked.emit({ lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) });
  }

  /* ----------------------------------------------------------------- Google Maps */

  private async syncGoogle(el: HTMLElement, point: { lat: number; lng: number } | null): Promise<void> {
    try {
      await loadGoogleMaps();
      const { Map } = (await google.maps.importLibrary('maps')) as google.maps.MapsLibrary;
      const { AdvancedMarkerElement } = (await google.maps.importLibrary('marker')) as google.maps.MarkerLibrary;
      if (this.destroyed) return;
      this.error.set(null);

      if (!this.gMap) {
        this.gMap = new Map(el, {
          center: point ?? DEFAULT_CENTER,
          zoom: point ? 15 : 7,
          mapId: 'DEMO_MAP_ID',
          gestureHandling: 'cooperative',
          streetViewControl: false,
          mapTypeControl: false,
        });
        this.gMap.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) this.emit(event.latLng.lat(), event.latLng.lng());
        });
      }

      if (point) {
        if (!this.gMarker) {
          this.gMarker = new AdvancedMarkerElement({ map: this.gMap, position: point });
        } else {
          this.gMarker.position = point;
          this.gMarker.map = this.gMap;
        }
        this.gMap.panTo(point);
      } else if (this.gMarker) {
        this.gMarker.map = null;
      }
    } catch {
      if (!this.destroyed) {
        this.error.set('No se pudo cargar Google Maps. Revisá la clave y sus restricciones.');
      }
    }
  }

  /* --------------------------------------------------------------- OpenStreetMap */

  private syncLeaflet(el: HTMLElement, point: { lat: number; lng: number } | null): void {
    if (!this.leafletMap) {
      const start = point ?? DEFAULT_CENTER;
      this.leafletMap = L.map(el, { scrollWheelZoom: false }).setView([start.lat, start.lng], point ? 14 : 7);
      L.tileLayer(OSM_TILE_URL, {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
      }).addTo(this.leafletMap);
      this.leafletMap.on('click', (event: L.LeafletMouseEvent) => this.emit(event.latlng.lat, event.latlng.lng));
      setTimeout(() => this.leafletMap?.invalidateSize(), 0);
    }

    if (point) {
      if (!this.leafletMarker) {
        // Marca propia (como la del mapa del sitio): el ícono por defecto de Leaflet pide imágenes que no están.
        const icon = L.divIcon({
          className: '',
          html: '<span style="display:block;width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#d06a28;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></span>',
          iconSize: [26, 26],
          iconAnchor: [13, 26],
        });
        this.leafletMarker = L.marker([point.lat, point.lng], { icon }).addTo(this.leafletMap);
      } else {
        this.leafletMarker.setLatLng([point.lat, point.lng]);
      }
    } else if (this.leafletMarker) {
      this.leafletMarker.remove();
      this.leafletMarker = null;
    }
  }
}
