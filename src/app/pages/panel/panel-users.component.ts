import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivityLog } from '../../data/activity-log';
import { AuthService } from '../../data/auth.service';
import { ROLE_DESCRIPTIONS, ROLE_LABELS, type Role } from '../../data/permissions';
import { UsersStore, type PanelUser } from '../../data/users-store';
import { PanelShellComponent } from './panel-shell.component';

@Component({
  selector: 'app-panel-users',
  standalone: true,
  imports: [FormsModule, DatePipe, PanelShellComponent],
  template: `
    <app-panel-shell title="Usuarios">
      @if (message(); as text) {
        <p class="mb-6 rounded-lg border border-border bg-background px-4 py-3 text-sm text-forest-deep" role="status">{{ text }}</p>
      }

      <!-- Tipos de usuario -->
      <section class="grid gap-4 md:grid-cols-3">
        @for (r of roles; track r) {
          <div class="mer-card p-4">
            <p class="font-medium text-forest-deep">{{ roleLabels[r] }}</p>
            <p class="mt-1 text-sm text-muted-foreground">{{ roleDescriptions[r] }}</p>
          </div>
        }
      </section>

      <!-- Listado -->
      <ul class="mt-8 space-y-3">
        @for (user of users.all(); track user.id) {
          <li class="mer-card p-4">
            <div class="flex flex-col gap-3 md:flex-row md:items-center">
              <div class="min-w-0 flex-1">
                <p class="font-medium text-forest-deep">
                  {{ user.name }}
                  @if (user.id === auth.user()?.id) {
                    <span class="ml-1 text-xs font-normal text-muted-foreground">(vos)</span>
                  }
                </p>
                <p class="text-sm text-muted-foreground">{{ user.email }}</p>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <select
                  class="h-10 rounded-lg border border-border bg-background px-2 text-sm"
                  [ngModel]="user.role"
                  (ngModelChange)="changeRole(user, $event)"
                  [attr.aria-label]="'Tipo de usuario de ' + user.name"
                >
                  @for (r of roles; track r) {
                    <option [value]="r">{{ roleLabels[r] }}</option>
                  }
                </select>
                <button
                  type="button"
                  class="h-10 rounded-lg border border-border px-3 text-sm font-medium transition hover:border-forest"
                  (click)="toggleActive(user)"
                >
                  {{ user.active ? 'Desactivar' : 'Activar' }}
                </button>
                <button
                  type="button"
                  class="h-10 rounded-lg border border-border px-3 text-sm font-medium transition hover:border-forest"
                  (click)="resetPassword(user)"
                >
                  Nueva clave
                </button>
              </div>
            </div>
            @if (!user.active) {
              <p class="mt-2 text-xs text-muted-foreground">Desactivado: no puede ingresar.</p>
            }
          </li>
        }
      </ul>

      <!-- Alta -->
      <section class="mt-10 mer-card p-5">
        <h2 class="font-display text-lg font-medium text-forest-deep">Agregar usuario</h2>
        <form class="mt-4 grid gap-4 md:grid-cols-2" (submit)="create($event)">
          <label>
            <span class="mb-1.5 block text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">Nombre</span>
            <input class="h-11 w-full rounded-lg border border-border bg-background px-3.5 text-sm" name="name" [(ngModel)]="form.name" />
          </label>
          <label>
            <span class="mb-1.5 block text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">Email</span>
            <input class="h-11 w-full rounded-lg border border-border bg-background px-3.5 text-sm" type="email" name="email" [(ngModel)]="form.email" />
          </label>
          <label>
            <span class="mb-1.5 block text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">Tipo</span>
            <select class="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm" name="role" [(ngModel)]="form.role">
              @for (r of roles; track r) {
                <option [value]="r">{{ roleLabels[r] }}</option>
              }
            </select>
          </label>
          <label>
            <span class="mb-1.5 block text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">Clave inicial (8+ caracteres)</span>
            <input class="h-11 w-full rounded-lg border border-border bg-background px-3.5 text-sm" type="password" name="password" autocomplete="new-password" [(ngModel)]="form.password" />
          </label>
          <div class="md:col-span-2">
            <button
              type="submit"
              class="h-11 rounded-lg bg-forest-deep px-6 text-sm font-semibold text-stone-warm transition hover:bg-forest hover:text-white"
            >
              Crear usuario
            </button>
          </div>
        </form>
      </section>

      <!-- Actividad -->
      <section class="mt-10">
        <h2 class="font-display text-xl font-medium text-forest-deep">Actividad reciente</h2>
        <ul class="mt-4 divide-y divide-border/70 mer-card">
          @for (entry of activity.entries().slice(0, 15); track entry.at + entry.action) {
            <li class="flex flex-wrap gap-x-3 gap-y-1 px-4 py-2.5 text-sm">
              <span class="tabular-nums text-muted-foreground">{{ entry.at | date: 'dd/MM HH:mm' }}</span>
              <span class="font-medium text-forest-deep">{{ entry.user }}</span>
              <span>{{ entry.action }}</span>
            </li>
          } @empty {
            <li class="px-4 py-4 text-sm text-muted-foreground">Todavía no hay movimientos registrados.</li>
          }
        </ul>
      </section>
    </app-panel-shell>
  `,
})
export class PanelUsersComponent {
  readonly users = inject(UsersStore);
  readonly auth = inject(AuthService);
  readonly activity = inject(ActivityLog);

  readonly roles: Role[] = ['titular', 'agente', 'consulta'];
  readonly roleLabels = ROLE_LABELS;
  readonly roleDescriptions = ROLE_DESCRIPTIONS;
  readonly message = signal<string | null>(null);

  form = { name: '', email: '', role: 'agente' as Role, password: '' };

  private log(action: string) {
    this.activity.log(this.auth.user()?.name ?? 'Sistema', action);
  }

  changeRole(user: PanelUser, role: Role) {
    const error = this.users.update(user.id, { role });
    this.message.set(error ?? `${user.name} ahora es ${ROLE_LABELS[role]}.`);
    if (!error) this.log(`Cambió el tipo de ${user.name} a ${ROLE_LABELS[role]}`);
  }

  toggleActive(user: PanelUser) {
    const error = this.users.update(user.id, { active: !user.active });
    this.message.set(error ?? `${user.name} ${user.active ? 'fue desactivado' : 'fue activado'}.`);
    if (!error) this.log(`${user.active ? 'Desactivó' : 'Activó'} a ${user.name}`);
  }

  async resetPassword(user: PanelUser) {
    const password = prompt(`Nueva clave para ${user.name} (8 caracteres o más):`);
    if (password === null) return;
    const error = await this.users.resetPassword(user.id, password);
    this.message.set(error ?? `Se cambió la clave de ${user.name}.`);
    if (!error) this.log(`Cambió la clave de ${user.name}`);
  }

  async create(event: Event) {
    event.preventDefault();
    const error = await this.users.create(this.form);
    if (error) {
      this.message.set(error);
      return;
    }
    this.message.set(`Se creó el usuario ${this.form.name.trim()}.`);
    this.log(`Creó el usuario ${this.form.name.trim()} (${ROLE_LABELS[this.form.role]})`);
    this.form = { name: '', email: '', role: 'agente', password: '' };
  }
}
