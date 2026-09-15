import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONTACT } from '../data/properties';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="border-t border-white/10 bg-forest-deep text-white/75">
      <div class="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div>
          <img
            src="/about/logo-mark.png"
            alt="Mariana Echeverría Bienes Raíces"
            class="h-12 w-auto max-w-[260px] bg-transparent object-contain object-left"
          />
          <p class="mt-5 max-w-sm text-sm leading-relaxed text-white/65">
            Corredora, tasadora y martillera pública. {{ contact.matricula }}.
            Venta, alquiler, arrendamientos, tasaciones en el día y home staging.
          </p>
        </div>
        <div>
          <p class="text-xs font-semibold tracking-[0.16em] text-stone-warm uppercase">Explorar</p>
          <ul class="mt-5 space-y-2.5 text-sm">
            <li><a routerLink="/" fragment="servicios" class="transition hover:text-stone-warm">Servicios</a></li>
            <li><a routerLink="/" fragment="propiedades" class="transition hover:text-stone-warm">Propiedades</a></li>
            <li><a routerLink="/" fragment="instagram" class="transition hover:text-stone-warm">Instagram</a></li>
            <li><a routerLink="/" fragment="trayectoria" class="transition hover:text-stone-warm">Trayectoria</a></li>
            <li><a routerLink="/" fragment="contacto" class="transition hover:text-stone-warm">Contacto</a></li>
          </ul>
        </div>
        <div>
          <p class="text-xs font-semibold tracking-[0.16em] text-stone-warm uppercase">Contacto</p>
          <ul class="mt-5 space-y-2.5 text-sm">
            <li>
              <a [href]="contact.whatsappUrl" target="_blank" rel="noopener noreferrer" class="transition hover:text-stone-warm">
                WhatsApp {{ contact.phoneDisplay }}
              </a>
            </li>
            <li>
              <a [href]="'mailto:' + contact.email" class="transition hover:text-stone-warm">{{ contact.email }}</a>
            </li>
            <li>
              <a [href]="contact.instagramUrl" target="_blank" rel="noopener noreferrer" class="transition hover:text-stone-warm">
                &#64;{{ contact.instagram }}
              </a>
            </li>
            @for (office of contact.offices; track office.name) {
              <li class="pt-1 text-white/50">{{ office.name }}: {{ office.address }}</li>
            }
          </ul>
        </div>
      </div>
      <div class="h-px w-full bg-gradient-to-r from-clay-deep via-stone-warm to-forest opacity-80"></div>
      <div class="border-t border-white/10">
        <p class="mx-auto max-w-6xl px-5 py-5 text-xs text-white/40 md:px-8">
          Demo Angular de rediseño — no es el sitio oficial · COPYRIGHT {{ year }}
        </p>
      </div>
    </footer>
  `,
})
export class SiteFooterComponent {
  readonly contact = CONTACT;
  readonly year = new Date().getFullYear();
}
