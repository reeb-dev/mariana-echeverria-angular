import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PropertyGalleryComponent } from '../components/property-gallery.component';
import { CONTACT, PROPERTIES, getPropertyBySlug } from '../data/properties';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [RouterLink, PropertyGalleryComponent],
  templateUrl: './property-detail.component.html',
})
export class PropertyDetailComponent {
  private readonly route = inject(ActivatedRoute);
  readonly contact = CONTACT;

  readonly property = (() => {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    return getPropertyBySlug(slug) ?? null;
  })();

  readonly related = this.property
    ? PROPERTIES.filter(
        (p) =>
          p.id !== this.property!.id && p.operation === this.property!.operation
      ).slice(0, 3)
    : [];

  waUrl() {
    if (!this.property) return this.contact.whatsappUrl;
    return `${this.contact.whatsappUrl}?text=${encodeURIComponent(
      `Hola Mariana, vi la ficha de "${this.property.title}" (${this.property.location}) y quiero más info.`
    )}`;
  }
}
