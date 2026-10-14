import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export type SeoInput = {
  title: string;
  description: string;
  /** URL absoluta de una imagen para compartir (se ignora si es un data URL). */
  image?: string;
  /** Datos estructurados (schema.org) de la página; null los quita. */
  jsonLd?: Record<string, unknown> | null;
};

const JSON_LD_ID = 'mer-jsonld';

/** Título, descripción, tarjeta para compartir y datos estructurados de cada página. */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  set(input: SeoInput): void {
    this.title.setTitle(input.title);
    this.meta.updateTag({ name: 'description', content: input.description });
    this.meta.updateTag({ property: 'og:title', content: input.title });
    this.meta.updateTag({ property: 'og:description', content: input.description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:locale', content: 'es_AR' });
    this.meta.updateTag({ name: 'twitter:card', content: input.image ? 'summary_large_image' : 'summary' });
    if (input.image && /^https?:/i.test(input.image)) {
      this.meta.updateTag({ property: 'og:image', content: input.image });
    } else {
      this.meta.removeTag("property='og:image'");
    }
    this.setJsonLd(input.jsonLd ?? null);
  }

  private setJsonLd(data: Record<string, unknown> | null): void {
    const existing = this.doc.getElementById(JSON_LD_ID);
    if (!data) {
      existing?.remove();
      return;
    }
    const script = existing ?? this.doc.createElement('script');
    script.id = JSON_LD_ID;
    script.setAttribute('type', 'application/ld+json');
    script.textContent = JSON.stringify(data);
    if (!existing) this.doc.head.appendChild(script);
  }
}

/** Convierte «USD 54.000» o «$ 1.200.000 / mes» en monto y moneda; null si dice «Consultar». */
export function parsePrice(label: string): { price: number; currency: 'USD' | 'ARS' } | null {
  const digits = label.replace(/[^\d.]/g, '').replace(/\./g, '');
  if (!digits) return null;
  const price = Number(digits);
  if (!Number.isFinite(price) || price <= 0) return null;
  return { price, currency: /usd|u\$s/i.test(label) ? 'USD' : 'ARS' };
}
