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
      class="fixed bottom-4 right-4 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border border-stone-warm/40 bg-forest-deep/90 text-stone-warm shadow-soft backdrop-blur-sm transition hover:border-stone-warm hover:bg-forest-deep hover:text-white md:bottom-6 md:right-6 md:h-11 md:w-11 md:opacity-80 md:hover:opacity-100"
      aria-label="Escribir por WhatsApp"
      title="WhatsApp"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        class="h-5 w-5"
        aria-hidden="true"
      >
        <path
          d="M12.04 2C6.58 2 2.15 6.4 2.15 11.84c0 1.97.58 3.84 1.58 5.4L2 22l4.92-1.63a9.86 9.86 0 0 0 5.12 1.42h.01c5.46 0 9.89-4.4 9.89-9.84C21.94 6.4 17.5 2 12.04 2zm5.76 13.99c-.24.68-1.4 1.25-1.93 1.33-.49.07-1.12.1-1.81-.11-.42-.13-.96-.31-1.65-.61-2.9-1.26-4.78-4.18-4.93-4.38-.14-.2-1.18-1.57-1.18-3 0-1.42.74-2.12 1-2.41.26-.29.57-.36.76-.36h.55c.17 0 .41-.06.64.49.24.57.82 2 .89 2.15.07.15.12.32.02.51-.1.2-.15.32-.3.49-.15.17-.31.38-.45.51-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.03 1.12 1 2.07 1.31 2.36 1.46.29.15.46.12.63-.07.17-.2.73-.85.93-1.14.2-.29.39-.24.66-.14.26.1 1.67.79 1.96.93.29.15.48.22.55.34.07.13.07.74-.17 1.42z"
        />
      </svg>
    </a>
  `,
})
export class WhatsappFloatComponent {
  readonly contact = CONTACT;
}
