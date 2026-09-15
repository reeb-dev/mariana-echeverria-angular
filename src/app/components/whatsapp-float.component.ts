import { Component } from '@angular/core';
import { CONTACT } from '../data/properties';

@Component({
  selector: 'app-whatsapp-float',
  standalone: true,
  template: `
    <a
      [href]="contact.whatsappUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-full bg-forest px-4 py-3 text-sm font-semibold text-white shadow-brand transition hover:bg-clay-deep md:bottom-6 md:right-6"
      aria-label="Escribir por WhatsApp"
    >
      <span aria-hidden class="inline-flex h-2 w-2 rounded-full bg-stone-warm"></span>
      WhatsApp
    </a>
  `,
})
export class WhatsappFloatComponent {
  readonly contact = CONTACT;
}
