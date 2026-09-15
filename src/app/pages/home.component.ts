import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RevealDirective } from '../directives/reveal.directive';
import {
  CONTACT,
  CREDENTIALS,
  FAQS,
  INSTAGRAM_HIGHLIGHTS,
  PROCESS,
  PROPERTIES,
  SERVICES,
  TESTIMONIALS,
  ZONE_FILTERS,
  ZONES,
  coverPhoto,
  type Property,
  type PropertyOperation,
  type PropertyZone,
} from '../data/properties';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FormsModule, RevealDirective],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  readonly contact = CONTACT;
  readonly services = SERVICES;
  readonly zones = ZONES;
  readonly zoneFilters = ZONE_FILTERS;
  readonly process = PROCESS;
  readonly credentials = CREDENTIALS;
  readonly testimonials = TESTIMONIALS;
  readonly faqs = FAQS;
  readonly instagramHighlights = INSTAGRAM_HIGHLIGHTS;

  readonly filter = signal<'todas' | PropertyOperation>('todas');
  readonly zoneFilter = signal<'todas' | PropertyZone>('todas');
  readonly formState = signal<'idle' | 'error' | 'success'>('idle');
  readonly formMessage = signal(
    'Demo local: el envío abre WhatsApp con tu mensaje.'
  );

  name = '';
  email = '';
  phone = '';
  propertyType = '';
  operation = '';
  message = '';

  get properties(): Property[] {
    const op = this.filter();
    const zone = this.zoneFilter();
    return PROPERTIES.filter((p) => {
      const matchOp = op === 'todas' || p.operation === op;
      const matchZone = zone === 'todas' || p.zone === zone;
      return matchOp && matchZone;
    });
  }

  setFilter(value: 'todas' | PropertyOperation) {
    this.filter.set(value);
  }

  setZoneFilter(value: 'todas' | PropertyZone) {
    this.zoneFilter.set(value);
  }

  coverPhoto(property: Property) {
    return coverPhoto(property);
  }

  waFor(title: string, location: string) {
    return `${CONTACT.whatsappUrl}?text=${encodeURIComponent(
      `Hola Mariana, me interesa: ${title} (${location}).`
    )}`;
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

    window.open(
      `${CONTACT.whatsappUrl}?text=${encodeURIComponent(body)}`,
      '_blank',
      'noopener,noreferrer'
    );
    this.formState.set('success');
    this.formMessage.set(
      'Abrimos WhatsApp con tu consulta. Si no se abrió, escribí al número de contacto.'
    );
    this.name = '';
    this.email = '';
    this.phone = '';
    this.propertyType = '';
    this.operation = '';
    this.message = '';
  }
}
