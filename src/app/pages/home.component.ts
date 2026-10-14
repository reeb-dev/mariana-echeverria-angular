import { ToastService } from '../data/toast.service';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BrandLogoComponent } from '../components/brand-logo.component';
import { PropertiesMapComponent } from '../components/properties-map.component';
import { ContactsStore, SavedSearchesStore } from '../data/crm-stores';
import { samePhone } from '../data/collection-store';
import { PropertyCardComponent } from '../components/property-card.component';
import { RevealDirective } from '../directives/reveal.directive';
import {
  CONTACT,
  CREDENTIALS,
  FAQS,
  INSTAGRAM_HIGHLIGHTS,
  INSTAGRAM_POSTS,
  PROCESS,
  SERVICES,
  TESTIMONIALS,
  ZONES,
  zoneFilterOptionsFrom,
  type PropertyOperation,
  type PropertyZone,
} from '../data/properties';
import { FavoritesService } from '../data/favorites.service';
import { InquiriesStore } from '../data/inquiries-store';
import { PropertyStore } from '../data/property-store';
import { AssetUrlPipe } from '../utils/asset-url';
import { SeoService, parsePrice } from '../utils/seo.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    RevealDirective,
    BrandLogoComponent,
    PropertyCardComponent,
    PropertiesMapComponent,
    AssetUrlPipe,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  protected readonly toast = inject(ToastService);
  private readonly store = inject(PropertyStore);
  private readonly inquiries = inject(InquiriesStore);
  private readonly seo = inject(SeoService);
  private readonly savedSearches = inject(SavedSearchesStore);
  private readonly contactsStore = inject(ContactsStore);
  readonly favorites = inject(FavoritesService);
  readonly contact = CONTACT;
  readonly services = SERVICES;
  readonly zones = ZONES;
  readonly process = PROCESS;
  readonly credentials = CREDENTIALS;
  readonly testimonials = TESTIMONIALS;
  readonly faqs = FAQS;
  readonly instagramHighlights = INSTAGRAM_HIGHLIGHTS;
  readonly instagramPosts = INSTAGRAM_POSTS;

  /** Pedido corto de llamada: nombre y teléfono. */
  callback = { name: '', phone: '', consent: false };
  readonly callbackSent = signal(false);
  readonly callbackError = signal<string | null>(null);

  readonly filter = signal<'todas' | PropertyOperation>('todas');
  readonly zoneFilter = signal<'todas' | PropertyZone>('todas');
  readonly typeFilter = signal<'todos' | string>('todos');
  readonly onlyFavorites = signal(false);
  readonly maxPrice = signal<number | null>(null);
  readonly viewMode = signal<'lista' | 'mapa'>('lista');

  /** Buscador del encabezado: aplica los filtros y baja al listado. */
  heroSearch = { operation: 'todas' as 'todas' | PropertyOperation, type: 'todos', zone: 'todas' };

  readonly publishedCount = computed(() => this.store.published().length);

  private readonly serviceIcons: Record<string, string> = {
    Venta: 'M3 11l9-8 9 8 M5 10v10h14V10 M10 20v-6h4v6',
    'Alquiler y arrendamientos': 'M21 2l-2 2m-7.6 7.6a5.5 5.5 0 1 1-7.8 7.8 5.5 5.5 0 0 1 7.8-7.8z M11.4 11.6L15.5 7.5 M16 7l3 3 2-2-3-3',
    'Tasaciones en el día': 'M12 3v18 M5 8l7-5 7 5 M5 8l-3 7a4 4 0 0 0 6 0z M19 8l-3 7a4 4 0 0 0 6 0z',
    'Home staging y desarrollos': 'M4 20V9l8-5 8 5v11 M9 20v-6h6v6 M2 20h20',
    'Derecho inmobiliario': 'M12 3v18 M6 7h12 M6 7l-3 7a3 3 0 0 0 6 0z M18 7l-3 7a3 3 0 0 0 6 0z M8 21h8',
  };

  serviceIcon(title: string): string {
    return this.serviceIcons[title] ?? 'M12 5v14 M5 12h14';
  }

  submitCallback(event: Event) {
    event.preventDefault();
    const c = this.callback;
    if (!c.name.trim() || !c.phone.trim()) {
      this.callbackError.set('Dejanos tu nombre y tu teléfono.');
      this.toast.error('Dejanos tu nombre y tu teléfono.');
      return;
    }
    if (!c.consent) {
      this.callbackError.set('Tenés que aceptar la política de privacidad.');
      this.toast.error('Aceptá la política de privacidad.');
      return;
    }
    this.callbackError.set(null);
    this.inquiries.add({
      name: c.name.trim(),
      email: '',
      phone: c.phone.trim(),
      message: 'Pidió que lo llamen (formulario corto del inicio).',
    });
    this.callbackSent.set(true);
    this.toast.success('Listo, te llamamos a la brevedad.');
    this.callback = { name: '', phone: '', consent: false };
  }

  searchFromHero(event: Event) {
    event.preventDefault();
    this.filter.set(this.heroSearch.operation);
    this.typeFilter.set(this.heroSearch.type);
    this.setZoneFilter(this.heroSearch.zone);
    this.viewMode.set('lista');
    setTimeout(() => document.getElementById('propiedades')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  }
  readonly alertOpen = signal(false);
  readonly alertSent = signal(false);
  readonly alertError = signal<string | null>(null);
  alert = { name: '', phone: '', consent: false };
  readonly priceCurrency = signal<'USD' | 'ARS'>('USD');
  /** Texto del buscador de zona (autocomplete); se sincroniza con el select. */
  readonly zoneQuery = signal('');
  readonly formState = signal<'idle' | 'error' | 'success'>('idle');
  readonly formMessage = signal(
    'Demo local: el envío abre WhatsApp con tu mensaje.'
  );

  /** Zonas únicas del inventario — si agregás una zona nueva en data, aparece acá. */
  readonly zoneOptions = computed(() => zoneFilterOptionsFrom(this.store.published()));

  /** Destacadas elegidas en el panel. */
  readonly featured = this.store.featured;

  /** Tipos presentes en el inventario publicado (casa, lote, campo…). */
  readonly typeOptions = computed(() => [...new Set(this.store.published().map((p) => p.type))].sort());

  readonly properties = computed(() => {
    const op = this.filter();
    const zone = this.zoneFilter();
    return this.store.published().filter((p) => {
      const matchOp = op === 'todas' || p.operation === op;
      const matchZone = zone === 'todas' || p.zone === zone;
      const matchType = this.typeFilter() === 'todos' || p.type === this.typeFilter();
      const matchFavorite = !this.onlyFavorites() || this.favorites.has(p.slug);
      const max = this.maxPrice();
      let matchPrice = true;
      if (max !== null) {
        const parsed = parsePrice(p.priceLabel);
        matchPrice = !!parsed && parsed.currency === this.priceCurrency() && parsed.price <= max;
      }
      return matchOp && matchZone && matchType && matchFavorite && matchPrice;
    });
  });

  constructor() {
    this.seo.set({
      title: 'Mariana Echeverría Bienes Raíces | Inmobiliaria en Coronel Suárez y Zona Norte',
      description:
        'Venta, alquiler, arrendamientos y tasaciones en Coronel Suárez, Sierra de la Ventana y Zona Norte. Corredora y abogada con 25 años de trayectoria.',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'RealEstateAgent',
        name: 'Mariana Echeverría Bienes Raíces',
        telephone: CONTACT.phoneDisplay,
        email: CONTACT.email,
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Las Heras 1465',
          addressLocality: 'Coronel Suárez',
          addressCountry: 'AR',
        },
      },
    });
  }

  name = '';
  email = '';
  phone = '';
  consent = false;
  propertyType = '';
  operation = '';
  message = '';

  /** Las del listado actual que tienen ubicación, para el mapa. */
  readonly mappable = computed(() => this.properties().filter((p) => p.lat != null && p.lng != null));

  /** Guarda lo que se está buscando para avisarle a la persona cuando entre algo parecido. */
  submitAlert(event: Event) {
    event.preventDefault();
    if (!this.alert.name.trim() || !this.alert.phone.trim()) {
      this.alertError.set('Completá tu nombre y tu teléfono.');
      return;
    }
    if (!this.alert.consent) {
      this.alertError.set('Tenés que aceptar la política de privacidad.');
      return;
    }
    this.alertError.set(null);
    const name = this.alert.name.trim();
    const phone = this.alert.phone.trim();
    let contact = this.contactsStore.all().find((c) => samePhone(c.phone, phone));
    if (!contact) {
      contact = {
        id: this.contactsStore.newId('c'),
        name,
        phone,
        email: '',
        kind: 'comprador' as const,
        createdAt: new Date().toISOString(),
        consent: true,
      };
      this.contactsStore.save(contact);
    }
    const op = this.filter();
    const type = this.typeFilter();
    const zone = this.zoneFilter();
    this.savedSearches.save({
      id: this.savedSearches.newId('s'),
      contactId: contact.id,
      operation: op === 'todas' ? undefined : op,
      type: type === 'todos' ? undefined : type,
      zone: zone === 'todas' ? undefined : zone,
      maxPrice: this.maxPrice() ?? undefined,
      currency: this.priceCurrency(),
      active: true,
      createdAt: new Date().toISOString(),
      consent: true,
    });
    this.alertSent.set(true);
    this.toast.success('Alerta creada. Te avisamos cuando entre algo así.');
    this.alert = { name: '', phone: '', consent: false };
  }

  setTypeFilter(value: 'todos' | string) {
    this.typeFilter.set(value);
  }

  setFilter(value: 'todas' | PropertyOperation) {
    this.filter.set(value);
  }

  setZoneFilter(value: 'todas' | PropertyZone) {
    this.zoneFilter.set(value);
    if (value === 'todas') {
      this.zoneQuery.set('');
      return;
    }
    const match = this.zoneOptions().find((z) => z.id === value);
    this.zoneQuery.set(match?.label ?? '');
  }

  onZoneSelect(value: string) {
    this.setZoneFilter(
      value === 'todas' ? 'todas' : (value as PropertyZone)
    );
  }

  onZoneSearchInput(raw: string) {
    this.zoneQuery.set(raw);
    const q = raw.trim().toLowerCase();
    if (!q) {
      this.zoneFilter.set('todas');
      return;
    }
    const match = this.zoneOptions().find(
      (z) =>
        z.label.toLowerCase() === q ||
        z.id.toLowerCase() === q ||
        z.label.toLowerCase().startsWith(q)
    );
    if (match) {
      this.zoneFilter.set(match.id);
    }
  }

  onZoneSearchCommit() {
    const q = this.zoneQuery().trim().toLowerCase();
    if (!q) {
      this.setZoneFilter('todas');
      return;
    }
    const match = this.zoneOptions().find(
      (z) =>
        z.label.toLowerCase() === q ||
        z.id.toLowerCase() === q ||
        z.label.toLowerCase().includes(q)
    );
    if (match) {
      this.setZoneFilter(match.id);
    }
  }

  submitForm(event: Event) {
    event.preventDefault();
    if (!this.name.trim() || !this.email.trim() || !this.phone.trim()) {
      this.formState.set('error');
      this.formMessage.set('Completá nombre, email y teléfono para continuar.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.formState.set('error');
      this.formMessage.set('Revisá el email: el formato no parece válido.');
      return;
    }

    if (!this.consent) {
      this.formState.set('error');
      this.formMessage.set('Tenés que aceptar la política de privacidad para enviar la consulta.');
      return;
    }

    const body = [
      `Hola Mariana, soy ${this.name.trim()}.`,
      `Email: ${this.email.trim()}`,
      `Teléfono: ${this.phone.trim()}`,
      this.propertyType ? `Tipo de propiedad: ${this.propertyType}` : '',
      this.operation ? `Operación: ${this.operation}` : '',
      this.message ? `Consulta: ${this.message}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    // La consulta queda registrada en el panel además de abrirse por WhatsApp.
    this.inquiries.add({
      name: this.name.trim(),
      email: this.email.trim(),
      phone: this.phone.trim(),
      propertyType: this.propertyType || undefined,
      operation: this.operation || undefined,
      message: this.message.trim() || undefined,
    });

    window.open(
      `${CONTACT.whatsappUrl}?text=${encodeURIComponent(body)}`,
      '_blank',
      'noopener,noreferrer'
    );
    this.formState.set('success');
    this.formMessage.set(
      'Abrimos WhatsApp con tu consulta. Si no se abrió, escribí al número de contacto.'
    );
    this.consent = false;
    this.name = '';
    this.email = '';
    this.phone = '';
    this.propertyType = '';
    this.operation = '';
    this.message = '';
  }
}
