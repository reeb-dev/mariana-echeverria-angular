import type { Property } from './properties';
import { parsePrice } from '../utils/seo.service';

export type QualityCheck = {
  id: string;
  label: string;
  points: number;
  max: number;
  /** Qué hacer para sumar más puntos (vacío si ya está completo). */
  hint: string;
};

export type ListingQuality = {
  score: number;
  level: 'muy-bueno' | 'bueno' | 'a-mejorar';
  levelLabel: string;
  checks: QualityCheck[];
};

function tiered(value: number, tiers: [number, number][]): number {
  for (const [min, points] of tiers) {
    if (value >= min) return points;
  }
  return 0;
}

/** Puntúa (0 a 100) qué tan completo está un aviso y dice qué falta. */
export function listingQuality(p: Property): ListingQuality {
  const needsRooms = p.type === 'casa' || p.type === 'departamento';
  const photos = p.photos.length;
  const description = p.description.trim().length;
  const amenities = p.amenities.length;
  const hasPrice = parsePrice(p.priceLabel) !== null;

  const checks: QualityCheck[] = [
    {
      id: 'fotos',
      label: 'Fotos',
      max: 25,
      points: tiered(photos, [[8, 25], [6, 20], [4, 12], [1, 5]]),
      hint: photos >= 8 ? '' : `Tiene ${photos}. Con 8 o más el aviso gana confianza.`,
    },
    {
      id: 'descripcion',
      label: 'Descripción',
      max: 20,
      points: tiered(description, [[500, 20], [300, 15], [150, 8]]),
      hint: description >= 500 ? '' : `Tiene ${description} caracteres. Contá ambientes, estado y lo que la hace especial (500 o más).`,
    },
    {
      id: 'precio',
      label: 'Precio visible',
      max: 15,
      points: hasPrice ? 15 : 0,
      hint: hasPrice ? '' : 'Los avisos con precio reciben más consultas que los que dicen «Consultar».',
    },
    {
      id: 'superficie',
      label: 'Superficie',
      max: 10,
      points: /\d/.test(p.areaLabel) ? 10 : 0,
      hint: /\d/.test(p.areaLabel) ? '' : 'Falta la superficie.',
    },
    {
      id: 'ambientes',
      label: 'Dormitorios y baños',
      max: 10,
      points: !needsRooms ? 10 : (p.beds != null ? 5 : 0) + (p.baths != null ? 5 : 0),
      hint:
        !needsRooms || (p.beds != null && p.baths != null)
          ? ''
          : `Falta cargar ${[p.beds == null ? 'dormitorios' : '', p.baths == null ? 'baños' : ''].filter(Boolean).join(' y ')}.`,
    },
    {
      id: 'caracteristicas',
      label: 'Características',
      max: 10,
      points: tiered(amenities, [[5, 10], [3, 6], [1, 3]]),
      hint: amenities >= 5 ? '' : `Tiene ${amenities}. Sumá patio, cochera, servicios o cercanías (5 o más).`,
    },
    {
      id: 'ubicacion',
      label: 'Ubicación',
      max: 5,
      points: p.location.trim().length >= 8 ? 5 : 0,
      hint: p.location.trim().length >= 8 ? '' : 'Detallá la calle o el barrio.',
    },
    {
      id: 'destacado',
      label: 'Frase destacada',
      max: 5,
      points: p.highlight?.trim() ? 5 : 0,
      hint: p.highlight?.trim() ? '' : 'Una frase corta («Casa familiar», «Lote a metros del centro») ayuda a elegir.',
    },
  ];

  const score = checks.reduce((sum, c) => sum + c.points, 0);
  const level = score >= 80 ? 'muy-bueno' : score >= 60 ? 'bueno' : 'a-mejorar';
  const levelLabel = { 'muy-bueno': 'Muy bueno', bueno: 'Bueno', 'a-mejorar': 'A mejorar' }[level];
  return { score, level, levelLabel, checks };
}
