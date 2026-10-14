import { Injectable } from '@angular/core';
import type { DiffusionChannel } from './diffusion-store';

/** Qué canales tiene conectados el servidor (cuenta vinculada y credenciales vigentes). */
export type ChannelStatus = Partial<Record<DiffusionChannel, boolean>>;

export type PublishRequest = {
  propertyId: string;
  slug: string;
  title: string;
  /** Texto del epígrafe o de la descripción, tal como se va a publicar. */
  text: string;
  /** Solo Mercado Libre: título del aviso (hasta 60 caracteres). */
  listingTitle?: string;
  /** Direcciones públicas de las fotos (Mercado Libre y Facebook las descargan desde ahí). */
  photoUrls: string[];
  /** Imagen o video armados en el navegador (Instagram y Facebook). */
  media?: { blob: Blob; kind: 'image' | 'video'; filename: string };
};

export type PublishResult = { ok: true; url?: string } | { ok: false; error: string };

/**
 * Publicación en las plataformas a través del servidor propio: el navegador nunca ve los tokens de Meta ni de
 * Mercado Libre. Contrato (ver `PUBLICACION.md`):
 *
 *   GET  api/publish/status          → { instagram: boolean, facebook: boolean, mercadolibre: boolean }
 *   POST api/publish/{canal}         → multipart: `data` (JSON de PublishRequest sin el blob) y `media` (archivo)
 *                                      ← { ok: true, url } | { ok: false, error }
 */
@Injectable({ providedIn: 'root' })
export class PublishingService {
  async status(): Promise<ChannelStatus> {
    try {
      const response = await fetch('api/publish/status', { headers: { Accept: 'application/json' } });
      if (!response.ok) return {};
      const data = await response.json();
      return typeof data === 'object' && data ? (data as ChannelStatus) : {};
    } catch {
      return {};
    }
  }

  async publish(channel: DiffusionChannel, request: PublishRequest): Promise<PublishResult> {
    try {
      const form = new FormData();
      const { media, ...data } = request;
      form.append('data', JSON.stringify(data));
      if (media) form.append('media', media.blob, media.filename);
      const response = await fetch(`api/publish/${channel}`, { method: 'POST', body: form });
      const body = (await response.json().catch(() => null)) as { ok?: boolean; url?: string; error?: string } | null;
      if (response.ok && body?.ok) return { ok: true, url: body.url };
      return { ok: false, error: body?.error ?? 'La plataforma no aceptó la publicación.' };
    } catch {
      return { ok: false, error: 'No se pudo comunicar con el servidor de publicación.' };
    }
  }
}
