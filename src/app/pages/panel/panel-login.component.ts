import { ToastService } from '../../data/toast.service';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../data/auth.service';
import { CONTACT } from '../../data/properties';
import { AssetUrlPipe } from '../../utils/asset-url';

@Component({
  selector: 'app-panel-login',
  standalone: true,
  imports: [FormsModule, RouterLink, AssetUrlPipe],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-mist/60 px-5 py-10">
      <div class="w-full max-w-md">
        <div class="flex flex-col items-center gap-1.5"><img [src]="'/about/logo-watermark.png' | assetUrl" [alt]="contact.brand" class="h-12 w-auto" /><span class="text-xs font-semibold tracking-[0.16em] text-forest uppercase">Panel</span></div>
        <form
          class="mt-6 space-y-4 rounded-2xl border border-border bg-background p-6 shadow-soft"
          (submit)="submit($event)"
        >
          <h1 class="font-display text-2xl font-medium text-forest-deep">Ingresar</h1>
          <label class="block">
            <span class="mb-1.5 block text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">Email</span>
            <input
              type="email"
              name="email"
              autocomplete="username"
              class="h-11 w-full rounded-lg border border-border bg-background px-3.5 text-sm outline-none focus:border-forest focus:ring-2 focus:ring-forest/20"
              [(ngModel)]="email"
            />
          </label>
          <label class="block">
            <span class="mb-1.5 block text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">Clave</span>
            <input
              type="password"
              name="password"
              autocomplete="current-password"
              class="h-11 w-full rounded-lg border border-border bg-background px-3.5 text-sm outline-none focus:border-forest focus:ring-2 focus:ring-forest/20"
              [(ngModel)]="password"
            />
          </label>
          @if (error(); as message) {
            <p class="text-sm text-red-700" role="alert">{{ message }}</p>
          }
          <button
            type="submit"
            class="h-11 w-full rounded-lg bg-forest-deep text-sm font-semibold text-stone-warm transition hover:bg-forest hover:text-white disabled:opacity-60"
            [disabled]="busy()"
          >
            {{ busy() ? 'Ingresando…' : 'Ingresar' }}
          </button>
          <p class="text-center text-sm">
            <a routerLink="/" class="text-muted-foreground transition hover:text-forest">← Volver al sitio</a>
          </p>
        </form>

        <div class="mt-6 rounded-xl border border-stone-warm/50 bg-stone-warm/15 p-4 text-xs text-forest-deep">
          <p class="font-semibold">Versión de demostración: usuarios de ejemplo</p>
          <ul class="mt-2 space-y-1.5">
            @for (u of demoUsers; track u.email) {
              <li>
                <button type="button" class="text-left underline decoration-forest/30 underline-offset-2" (click)="fill(u)">
                  <strong>{{ u.role }}</strong> · {{ u.email }} · {{ u.password }}
                </button>
              </li>
            }
          </ul>
          <p class="mt-2 text-muted-foreground">
            Sin servidor no hay seguridad real: con el sistema en línea, el ingreso y los permisos los controla el servidor.
          </p>
        </div>
      </div>
    </div>
  `,
})
export class PanelLoginComponent {
  protected readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly contact = CONTACT;

  readonly demoUsers = [
    { role: 'Titular', email: 'mariana@demo.local', password: 'titular2026' },
    { role: 'Agente', email: 'agente@demo.local', password: 'agente2026' },
    { role: 'Solo consulta', email: 'consulta@demo.local', password: 'consulta2026' },
  ];

  email = '';
  password = '';
  readonly error = signal<string | null>(null);
  readonly busy = signal(false);

  constructor() {
    if (this.auth.user()) {
      void this.router.navigate(['/panel']);
    }
  }

  fill(user: { email: string; password: string }) {
    this.email = user.email;
    this.password = user.password;
  }

  async submit(event: Event) {
    event.preventDefault();
    if (!this.email.trim() || !this.password) {
      this.error.set('Completá el email y la clave.');
      this.toast.error('Completá el email y la clave.');
      return;
    }
    this.busy.set(true);
    const problem = await this.auth.login(this.email, this.password);
    this.busy.set(false);
    if (problem) {
      this.error.set(problem);
      this.toast.error(problem);
      return;
    }
    this.error.set(null);
    this.toast.success(`Hola, ${this.auth.user()?.name ?? 'bienvenida/o'}.`);
    void this.router.navigate(['/panel']);
  }
}
