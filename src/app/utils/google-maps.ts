import { GOOGLE_MAPS_API_KEY } from '../config/maps.config';

/** ¿Hay una clave de Google Maps configurada? Si no, el sitio usa OpenStreetMap. */
export const hasGoogleMaps = GOOGLE_MAPS_API_KEY.trim().length > 0;

/** Centro y zoom iniciales (sudoeste bonaerense) cuando todavía no hay marcas. */
export const DEFAULT_CENTER = { lat: -37.46, lng: -61.93 };

let loading: Promise<void> | null = null;

/** Carga el script de Google Maps una sola vez. Rechaza si la clave falla o no hay conexión. */
export function loadGoogleMaps(): Promise<void> {
  if (!hasGoogleMaps) return Promise.reject(new Error('Sin clave de Google Maps'));
  if (typeof google !== 'undefined' && typeof google.maps !== 'undefined') return Promise.resolve();
  if (loading) return loading;

  loading = new Promise<void>((resolve, reject) => {
    // Google llama a esta función si la clave es inválida o está mal restringida.
    (window as unknown as { gm_authFailure?: () => void }).gm_authFailure = () => {
      loading = null;
      reject(new Error('La clave de Google Maps fue rechazada'));
    };
    const script = document.createElement('script');
    script.src =
      'https://maps.googleapis.com/maps/api/js' +
      `?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY.trim())}&v=weekly&loading=async&language=es&region=AR`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loading = null;
      reject(new Error('No se pudo cargar Google Maps'));
    };
    document.head.appendChild(script);
  });
  return loading;
}

/** Enlace para abrir la ubicación en la app o el sitio de Google Maps. */
export function googleMapsLink(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

/** URL para incrustar el mapa en la ficha: con la API de Embed si hay clave, y si no con la vista pública de Google. */
export function googleEmbedUrl(lat: number, lng: number, approximate: boolean): string {
  if (hasGoogleMaps) {
    const key = encodeURIComponent(GOOGLE_MAPS_API_KEY.trim());
    return approximate
      ? `https://www.google.com/maps/embed/v1/view?key=${key}&center=${lat},${lng}&zoom=13`
      : `https://www.google.com/maps/embed/v1/place?key=${key}&q=${lat},${lng}&zoom=16`;
  }
  return approximate
    ? `https://maps.google.com/maps?ll=${lat},${lng}&z=13&output=embed`
    : `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
}
