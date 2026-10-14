import { Injectable } from '@angular/core';
import { CollectionStore } from './collection-store';

export type DiffusionChannel = 'instagram' | 'facebook' | 'mercadolibre' | 'whatsapp';

export const CHANNEL_LABELS: Record<DiffusionChannel, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  mercadolibre: 'Mercado Libre',
  whatsapp: 'WhatsApp',
};

/** Una propiedad que ya se publicó en un canal (para saber dónde está y dónde falta). */
export type Diffusion = {
  id: string;
  propertyId: string;
  channel: DiffusionChannel;
  /** Fecha ISO en que se marcó como publicada. */
  at: string;
};

@Injectable({ providedIn: 'root' })
export class DiffusionStore extends CollectionStore<Diffusion> {
  constructor() {
    super('mer.panel.diffusion', () => []);
  }

  find(propertyId: string, channel: DiffusionChannel): Diffusion | undefined {
    return this.all().find((d) => d.propertyId === propertyId && d.channel === channel);
  }

  /** Marca o desmarca el canal. Devuelve `true` si quedó publicado. */
  toggle(propertyId: string, channel: DiffusionChannel): boolean {
    const existing = this.find(propertyId, channel);
    if (existing) {
      this.remove(existing.id);
      return false;
    }
    this.save({ id: this.newId('d'), propertyId, channel, at: new Date().toISOString() });
    return true;
  }
}
