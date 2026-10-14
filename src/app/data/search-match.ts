import { parsePrice } from '../utils/seo.service';
import type { SavedSearch } from './crm-stores';
import type { Property } from './properties';

/** ¿La propiedad cumple con lo que busca la persona? Los criterios vacíos no filtran. */
export function matchesSearch(search: SavedSearch, property: Property): boolean {
  if (search.operation && property.operation !== search.operation) return false;
  if (search.type && property.type !== search.type) return false;
  if (search.zone && property.zone !== search.zone) return false;
  if (search.maxPrice != null) {
    const parsed = parsePrice(property.priceLabel);
    if (!parsed || parsed.currency !== search.currency || parsed.price > search.maxPrice) return false;
  }
  return true;
}
