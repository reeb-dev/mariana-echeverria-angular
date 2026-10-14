import { ToastService } from '../data/toast.service';
import { Component, computed, inject, signal } from '@angular/core';
import { DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PropertyCardComponent } from '../components/property-card.component';
import { PropertyGalleryComponent } from '../components/property-gallery.component';
import { FavoritesService } from '../data/favorites.service';
import { localIsoDate } from '../data/calculators';
import { VisitsStore } from '../data/crm-stores';
import { InquiriesStore } from '../data/inquiries-store';
import { StatsStore } from '../data/stats-store';
import { BRANCH_LABELS, CONTACT, branchOf, coverPhoto } from '../data/properties';
import { PropertyStore } from '../data/property-store';
import { AssetUrlPipe } from '../utils/asset-url';
import { googleEmbedUrl, googleMapsLink } from '../utils/google-maps';
import { SeoService, parsePrice } from '../utils/seo.service';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, PropertyGalleryComponent, PropertyCardComponent, AssetUrlPipe],
  templateUrl: './property-detail.component.html',
})
export class PropertyDetailComponent {
  protected readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(PropertyStore);
  private readonly seo = inject(SeoService);
  private readonly inquiries = inject(InquiriesStore);
  private readonly visits = inject(VisitsStore);
  private readonly stats = inject(StatsStore);
  readonly favorites = inject(FavoritesService);
  readonly contact = CONTACT;

  readonly property = (() => {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    const found = this.store.getBySlug(slug);
    // Las pausadas no se muestran al público.
    return found && this.store.statusOf(found) !== 'pausada' ? found : null;
  })();

  readonly related = this.property
    ? this.store.published().filter(
        (p) =>
          p.id !== this.property!.id && p.operation === this.property!.operation
      ).slice(0, 3)
    : [];

  readonly copied = signal(false);
  /** El formulario de datos de la ficha empieza plegado para que el panel entre en pantalla. */
  readonly formOpen = signal(false);
  readonly sent = signal(false);
  readonly formError = signal<string | null>(null);
  inquiry = { name: '', phone: '', message: '', consent: false };

  /** Pedido de visita desde la ficha: queda «para confirmar» en el panel. */
  readonly visitOpen = signal(false);
  readonly visitSent = signal(false);
  readonly visitError = signal<string | null>(null);
  readonly minVisitDate = localIsoDate(new Date(Date.now() + 86_400_000));
  visit = { name: '', phone: '', date: '', slot: 'tarde' as 'mañana' | 'tarde', consent: false };

  submitVisit(event: Event) {
    event.preventDefault();
    const p = this.property;
    if (!p) return;
    const v = this.visit;
    if (!v.name.trim() || !v.phone.trim() || !v.date) {
      this.visitError.set('Completá tu nombre, tu teléfono y el día que te queda cómodo.');
      return;
    }
    if (v.date < this.minVisitDate) {
      this.visitError.set('Elegí un día a partir de mañana.');
      this.toast.error('Elegí un día a partir de mañana.');
      return;
    }
    if (!v.consent) {
      this.visitError.set('Tenés que aceptar la política de privacidad.');
      this.toast.error('Tenés que aceptar la política de privacidad.');
      return;
    }
    this.visitError.set(null);
    const at = new Date(`${v.date}T${v.slot === 'mañana' ? '10:00' : '16:00'}:00`);
    const label = new Date(`${v.date}T12:00:00`).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'numeric',
    });
    this.visits.save({
      id: this.visits.newId('v'),
      propertySlug: p.slug,
      visitorName: v.name.trim(),
      visitorPhone: v.phone.trim(),
      preferred: `${label}, por la ${v.slot === 'mañana' ? 'mañana' : 'tarde'}`,
      at: at.toISOString(),
      status: 'solicitada',
      consent: true,
    });
    const text = [
      `Hola Mariana, soy ${v.name.trim()}. Quiero visitar "${p.title}".`,
      `Me queda cómodo ${label}, por la ${v.slot}.`,
      `Mi teléfono: ${v.phone.trim()}.`,
    ].join('\n');
    window.open(`${this.contact.whatsappUrl}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    this.visitSent.set(true);
    this.toast.success('Pedido de visita enviado.');
    this.visit = { name: '', phone: '', date: '', slot: 'tarde', consent: false };
  }
  private readonly sanitizer = inject(DomSanitizer);

  /** Datos principales con ícono: se muestran solo los que están cargados. */
  readonly facts = computed(() => {
    const p = this.property;
    if (!p) return [] as { icon: string; label: string; value: string }[];
    const rows: { icon: string; label: string; value: string | null }[] = [
      { icon: 'M4 4h16v16H4z M4 10h6 M10 4v6', label: 'Superficie', value: p.areaLabel?.trim() || null },
      {
        icon: 'M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7 M3 14h18 M3 18v2 M21 18v2 M7 9V6h4v3',
        label: p.beds === 1 ? 'Dormitorio' : 'Dormitorios',
        value: p.beds == null ? null : String(p.beds),
      },
      {
        icon: 'M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z M6 12V6a2 2 0 0 1 4 0 M7 19l-1 2 M17 19l1 2',
        label: p.baths === 1 ? 'Baño' : 'Baños',
        value: p.baths == null ? null : String(p.baths),
      },
      {
        icon: 'M5 16l1.5-5.5A2 2 0 0 1 8.4 9h7.2a2 2 0 0 1 1.9 1.5L19 16 M3 16h18v3H3z M7 19v2 M17 19v2',
        label: p.garages === 1 ? 'Cochera' : 'Cocheras',
        value: p.garages == null ? null : String(p.garages),
      },
      {
        icon: 'M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
        label: 'Antigüedad',
        value: p.ageYears == null ? null : p.ageYears === 0 ? 'A estrenar' : `${p.ageYears} años`,
      },
      {
        icon: 'M3 20h18 M5 20c0-5 3-9 7-12 4 3 7 7 7 12',
        label: 'Hectáreas',
        value: p.hectares == null ? null : `${p.hectares} ha`,
      },
      {
        icon: 'M4 20L10 4 M20 20L14 4 M12 8v2 M12 14v2',
        label: 'Distancia a ruta',
        value: p.routeDistanceKm == null ? null : `${p.routeDistanceKm} km`,
      },
    ];
    return rows.filter((r): r is { icon: string; label: string; value: string } => r.value !== null);
  });

  /** Sucursal que atiende la propiedad. */
  readonly branchLabel = computed(() => (this.property ? BRANCH_LABELS[branchOf(this.property)] : ''));

  /** Datos que no entran en la grilla principal: se muestran solo los cargados. */
  readonly extras = computed(() => {
    const p = this.property;
    if (!p) return [] as { label: string; value: string }[];
    const rows: { label: string; value: string | null }[] = [
      { label: 'Aptitud', value: p.aptitude?.trim() || null },
      { label: 'Mejoras', value: p.improvements?.trim() || null },
    ];
    return rows.filter((r): r is { label: string; value: string } => r.value !== null);
  });

  /** Enlace para abrir la ubicación en Google Maps (solo si el punto es exacto). */
  readonly mapsLink = computed(() => {
    const p = this.property;
    return p && p.lat != null && p.lng != null && !p.mapApprox ? googleMapsLink(p.lat, p.lng) : null;
  });

  /** Mapa de Google con la ubicación (o una zona, si es aproximada). */
  readonly mapUrl = computed<SafeResourceUrl | null>(() => {
    const p = this.property;
    if (!p || p.lat == null || p.lng == null) return null;
    if (!(Math.abs(p.lat) <= 90 && Math.abs(p.lng) <= 180)) return null;
    // La URL se arma solo con números validados: no entra texto de la propiedad.
    return this.sanitizer.bypassSecurityTrustResourceUrl(googleEmbedUrl(p.lat, p.lng, !!p.mapApprox));
  });

  constructor() {
    const p = this.property;
    if (!p) {
      this.seo.set({ title: 'Propiedad no encontrada | Mariana Echeverría Bienes Raíces', description: 'La propiedad no está disponible.' });
      return;
    }
    this.stats.recordView(p.slug);
    if (this.route.snapshot.queryParamMap.get('visita')) {
      this.visitOpen.set(true);
      setTimeout(() => document.getElementById('ficha-visita')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 600);
    }
    if (this.route.snapshot.queryParamMap.get('src') === 'cartel') {
      this.stats.recordOnce(p.slug, 'qr');
    }
    const origin = typeof location !== 'undefined' ? location.origin : '';
    const price = parsePrice(p.priceLabel);
    this.seo.set({
      title: `${p.title} | Mariana Echeverría Bienes Raíces`,
      description: p.description.slice(0, 160),
      image: p.photos[0] && !/^data:/i.test(p.photos[0].src) ? new URL(coverPhoto(p).src, origin || 'http://localhost').href : undefined,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'RealEstateListing',
        name: p.title,
        description: p.description,
        url: typeof location !== 'undefined' ? location.href : undefined,
        ...(price
          ? { offers: { '@type': 'Offer', price: price.price, priceCurrency: price.currency } }
          : {}),
      },
    });
  }

  shareUrl() {
    const text = `${this.property?.title ?? ''} — ${typeof location !== 'undefined' ? location.href : ''}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  }

  recordWhatsapp() {
    if (this.property) this.stats.record(this.property.slug, 'whatsapp');
  }

  recordShare() {
    if (this.property) this.stats.record(this.property.slug, 'shares');
  }

  async copyLink() {
    this.recordShare();
    try {
      await navigator.clipboard.writeText(location.href);
      this.copied.set(true);
      this.toast.success('Enlace copiado.');
      setTimeout(() => this.copied.set(false), 1800);
    } catch {
      this.toast.error('No se pudo copiar el enlace. Copialo desde la barra del navegador.');
    }
  }

  toggleFavorite() {
    if (!this.property) return;
    this.favorites.toggle(this.property.slug);
    this.toast.success(this.favorites.has(this.property.slug) ? 'Guardada en tus favoritas.' : 'Quitada de tus favoritas.');
  }

  submitInquiry(event: Event) {
    event.preventDefault();
    if (!this.property) return;
    if (!this.inquiry.name.trim() || !this.inquiry.phone.trim()) {
      this.formError.set('Completá tu nombre y tu teléfono.');
      this.toast.error('Completá tu nombre y tu teléfono.');
      return;
    }
    if (!this.inquiry.consent) {
      this.formError.set('Tenés que aceptar la política de privacidad para enviar la consulta.');
      this.toast.error('Aceptá la política de privacidad para enviar la consulta.');
      return;
    }
    this.formError.set(null);
    const p = this.property;
    this.inquiries.add({
      name: this.inquiry.name.trim(),
      email: '',
      phone: this.inquiry.phone.trim(),
      propertyType: p.type,
      operation: p.operation,
      message: this.inquiry.message.trim() || undefined,
      propertyTitle: p.title,
      propertySlug: p.slug,
    });
    const body = [
      `Hola Mariana, soy ${this.inquiry.name.trim()}. Mi teléfono: ${this.inquiry.phone.trim()}.`,
      `Consulta por: ${p.title} (${p.location}).`,
      this.inquiry.message.trim(),
    ]
      .filter(Boolean)
      .join('\n');
    window.open(`${this.contact.whatsappUrl}?text=${encodeURIComponent(body)}`, '_blank', 'noopener,noreferrer');
    this.sent.set(true);
    this.toast.success('Consulta enviada. Te respondemos a la brevedad.');
    this.inquiry = { name: '', phone: '', message: '', consent: false };
  }

  waUrl() {
    if (!this.property) return this.contact.whatsappUrl;
    return `${this.contact.whatsappUrl}?text=${encodeURIComponent(
      `Hola Mariana, vi la ficha de "${this.property.title}" (${this.property.location}) y quiero más info.`
    )}`;
  }
}
