import { Injectable } from '@angular/core';
import type { Property } from './properties';

export type AiTone = 'profesional' | 'cercano' | 'premium';

export const TONE_LABELS: Record<AiTone, string> = {
  profesional: 'Profesional',
  cercano: 'Cercano',
  premium: 'Premium',
};

/** Paquete de textos para publicar la propiedad en cada lugar. */
export type CopyPackage = {
  titulo: string;
  descripcion: string;
  caracteristicas: string[];
  instagram: string;
  facebook: string;
  mercadolibre_titulo: string;
  mercadolibre_descripcion: string;
  whatsapp: string;
  sugerencias: string[];
  /** De dónde salió: la IA (con las fotos) o la plantilla de respaldo. */
  source: 'ia' | 'plantilla';
  /** Cuántas fotos miró la IA. */
  photosUsed: number;
};

export type CopyInput = {
  tone: AiTone;
  property: {
    operation: string;
    type: string;
    zone: string;
    location: string;
    priceLabel: string;
    areaLabel: string;
    beds?: number;
    baths?: number;
    highlight?: string;
    amenities: string[];
    description?: string;
  };
  photos: { dataUrl: string; caption: string }[];
};

const ENDPOINT = 'api/ai/listing-copy';

function cap(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
}

/** Respaldo sin IA: arma los textos con una plantilla a partir de los datos cargados. */
export function templatePackage(input: CopyInput): CopyPackage {
  const p = input.property;
  const operation = p.operation === 'alquiler' ? 'alquiler' : 'venta';
  const kind = cap(p.type || 'propiedad');
  const where = p.location || 'una excelente ubicación';
  const facts: string[] = [];
  if (p.areaLabel) facts.push(p.areaLabel);
  if (p.beds != null) facts.push(`${p.beds} ${p.beds === 1 ? 'dormitorio' : 'dormitorios'}`);
  if (p.baths != null) facts.push(`${p.baths} ${p.baths === 1 ? 'baño' : 'baños'}`);
  const price = p.priceLabel && !/consultar/i.test(p.priceLabel) ? p.priceLabel : '';

  const titulo = `${kind} en ${operation} – ${where}`.slice(0, 80);
  const paragraphs = [
    `${kind} en ${operation} en ${where}${facts.length ? `, con ${joinList(facts)}` : ''}.`,
  ];
  if (p.highlight) paragraphs.push(`${cap(p.highlight)}.`);
  if (p.amenities.length > 0) paragraphs.push(`Cuenta con ${joinList(p.amenities.map((a) => a.toLowerCase()))}.`);
  paragraphs.push(price ? `Precio: ${price}. Consultá para coordinar una visita.` : 'Consultá el precio y coordiná una visita.');
  const descripcion = paragraphs.join('\n\n');

  const hashtags = ['#CoronelSuarez', `#${kind.replace(/\s/g, '')}`, `#${cap(operation)}`, '#Inmuebles', '#BienesRaices']
    .filter((v, i, all) => all.indexOf(v) === i)
    .join(' ');
  const instagram = `${titulo}\n\n${paragraphs.slice(0, 2).join(' ')}\n\n${
    price ? `💲 ${price}\n` : ''
  }📩 Escribinos por mensaje directo o WhatsApp.\n\n${hashtags}`;
  const facebook = `${titulo}\n\n${descripcion}\n\nEscribinos por Messenger o WhatsApp para más información.`;
  const mlTitulo = `${kind} en ${operation} ${p.location}`.slice(0, 60);

  const sugerencias: string[] = [];
  if (input.photos.length < 5) sugerencias.push('Sumá más fotos: con 6 o más el aviso genera más consultas.');
  if (!p.description || p.description.length < 200) sugerencias.push('La descripción es corta: contá ambientes, estado y qué la hace especial.');
  if (/casa|departamento/i.test(p.type) && p.beds == null) sugerencias.push('Falta la cantidad de dormitorios.');
  if (/casa|departamento/i.test(p.type) && p.baths == null) sugerencias.push('Falta la cantidad de baños.');
  if (!price) sugerencias.push('El precio no está visible: los avisos con precio reciben más consultas.');
  if (p.amenities.length < 3) sugerencias.push('Cargá más características (patio, cochera, servicios, etc.).');

  return {
    titulo,
    descripcion,
    caracteristicas: p.amenities.length > 0 ? p.amenities : [],
    instagram,
    facebook,
    mercadolibre_titulo: mlTitulo,
    mercadolibre_descripcion: descripcion,
    whatsapp: `Hola, te paso la info de ${titulo.toLowerCase()}. ${price ? `Precio: ${price}. ` : ''}Si querés, coordinamos una visita.`,
    sugerencias,
    source: 'plantilla',
    photosUsed: 0,
  };
}

@Injectable({ providedIn: 'root' })
export class AiCopyService {
  /**
   * Pide los textos al servidor de IA. Si no responde (no está corriendo o no tiene clave),
   * devuelve la plantilla de respaldo para que el panel igual sirva.
   */
  async generate(input: CopyInput): Promise<CopyPackage> {
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        return templatePackage(input);
      }
      const data = (await response.json()) as Partial<CopyPackage> & { photosUsed?: number };
      if (typeof data.descripcion !== 'string' || typeof data.titulo !== 'string') {
        return templatePackage(input);
      }
      return {
        titulo: data.titulo,
        descripcion: data.descripcion,
        caracteristicas: data.caracteristicas ?? [],
        instagram: data.instagram ?? '',
        facebook: data.facebook ?? '',
        mercadolibre_titulo: (data.mercadolibre_titulo ?? data.titulo).slice(0, 60),
        mercadolibre_descripcion: data.mercadolibre_descripcion ?? data.descripcion,
        whatsapp: data.whatsapp ?? '',
        sugerencias: data.sugerencias ?? [],
        source: 'ia',
        photosUsed: data.photosUsed ?? input.photos.length,
      };
    } catch {
      return templatePackage(input);
    }
  }
}
