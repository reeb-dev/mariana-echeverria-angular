import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteFooterComponent } from './components/site-footer.component';
import { SiteNavComponent } from './components/site-nav.component';
import { WhatsappFloatComponent } from './components/whatsapp-float.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SiteNavComponent, SiteFooterComponent, WhatsappFloatComponent],
  template: `
    <app-site-nav />
    <main class="min-h-screen">
      <router-outlet />
    </main>
    <app-site-footer />
    <app-whatsapp-float />
  `,
})
export class AppComponent {}
