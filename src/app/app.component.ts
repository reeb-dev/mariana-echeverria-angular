import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { GOATCOUNTER_CODE } from './config/analytics.config';
import { SiteFooterComponent } from './components/site-footer.component';
import { ToastHostComponent } from './components/toast-host.component';
import { SiteNavComponent } from './components/site-nav.component';
import { WhatsappFloatComponent } from './components/whatsapp-float.component';

/** El panel y la página del link en bio no llevan la barra, el pie ni el botón de WhatsApp del sitio. */
function isBarePath(url: string): boolean {
  const path = url.split(/[?#]/)[0];
  return path.startsWith('/panel') || path === '/ig';
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SiteNavComponent, SiteFooterComponent, WhatsappFloatComponent, ToastHostComponent],
  template: `
    @if (isBare()) {
      <router-outlet />
    } @else {
      <app-site-nav />
      <main class="min-h-screen">
        <router-outlet />
      </main>
      <app-site-footer />
      @if (!isDetail()) {
        <app-whatsapp-float />
      }
    }
    <app-toast-host />
  `,
})
export class AppComponent {
  private readonly router = inject(Router);

  constructor() {
    // Medición opcional: solo se carga si hay un código configurado (config/analytics.config.ts).
    if (GOATCOUNTER_CODE.trim() && typeof document !== 'undefined') {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://gc.zgo.at/count.js';
      script.dataset['goatcounter'] = `https://${GOATCOUNTER_CODE.trim()}.goatcounter.com/count`;
      document.head.appendChild(script);
    }
  }

  /** La ficha ya tiene su barra de contacto fija en el celular. */
  readonly isDetail = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects.split(/[?#]/)[0].startsWith('/propiedades/'))
    ),
    { initialValue: this.router.url.split(/[?#]/)[0].startsWith('/propiedades/') }
  );

  /** El panel no lleva la barra, el pie ni el botón de WhatsApp del sitio. */
  readonly isBare = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => isBarePath(e.urlAfterRedirects))
    ),
    { initialValue: isBarePath(this.router.url) }
  );
}
