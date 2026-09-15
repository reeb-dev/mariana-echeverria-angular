import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONTACT } from '../data/properties';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="border-t border-white/10 bg-forest-deep text-white/75">
      <div class="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[1.3fr_1fr_1fr] md:px-8">
        <div>
          <img
            src="/about/logo-mark.png"
            alt="Mariana Echeverría Bienes Raíces"
            class="h-12 w-auto max-w-[260px] object-contain object-left"
          />
          <p class="mt-4 max-w-sm text-sm leading-relaxed">
            Corredora, tasadora y martillera pública. {{ contact.matricula }}.
            Venta, alquiler, arrendamientos, tasaciones en el día y home staging.
          </p>
        </div>
        <div>
          <p class="text-xs font-semibold tracking-[0.16em] text-stone-warm uppercase">Explorar</p>
          <ul class="mt-4 space-y-2 text-sm">
            <li><a routerLink="/" fragment="servicios" class="hover:text-stone-warm">Servicios</a></li>
            <li><a routerLink="/" fragment="propiedades" class="hover:text-stone-warm">Propiedades</a></li>
            <li><a routerLink="/" fragment="instagram" class="hover:text-stone-warm">Instagram</a></li>
            <li><a routerLink="/" fragment="trayectoria" class="hover:text-stone-warm">Trayectoria</a></li>
            <li><a routerLink="/" fragment="contacto" class="hover:text-stone-warm">Contacto</a></li>
          </ul>
        </div>
        <div>
          <p class="text-xs font-semibold tracking-[0.16em] text-stone-warm uppercase">Contacto</p>
          <ul class="mt-4 space-y-2 text-sm">
            <li>
              <a [href]="contact.whatsappUrl" target="_blank" rel="noopener noreferrer" class="hover:text-stone-warm">
                WhatsApp {{ contact.phoneDisplay }}
              </a>
            </li>
            <li>
              <a [href]="'mailto:' + contact.email" class="hover:text-stone-warm">{{ contact.email }}</a>
            </li>
            <li>
              <a [href]="contact.instagramUrl" target="_blank" rel="noopener noreferrer" class="hover:text-stone-warm">
                &#64;{{ contact.instagram }}
              </a>
            </li>
            @for (office of contact.offices; track office.name) {
              <li class="pt-1 text-white/55">{{ office.name }}: {{ office.address }}</li>
            }
          </ul>
        </div>
      </div>
      <div class="bg-gradient-to-r from-clay-deep via-forest to-stone-warm">
        <p class="mx-auto max-w-6xl px-5 py-3 text-center text-xs font-semibold text-forest-deep md:px-8 md:text-left">
          ☎ {{ contact.phoneDisplay }} / {{ contact.phoneSecondary }}
          · ✉ {{ contact.email }}
          · {{ contact.matricula }}
        </p>
      </div>
      <div class="border-t border-white/10">
        <p class="mx-auto max-w-6xl px-5 py-4 text-xs text-white/45 md:px-8">
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
