import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { roleCan, type Permission, type Role } from './permissions';
import type { Property } from './properties';
import { hashPassword, UsersStore, type PanelUser } from './users-store';

const SESSION_KEY = 'mer.session.v1';

/**
 * Sesión del panel (demo). La sesión vive en sessionStorage: se cierra al cerrar la pestaña.
 * Es control de interfaz; la seguridad real tiene que ocurrir en el servidor.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly users = inject(UsersStore);
  private readonly router = inject(Router);
  private readonly userId = signal<string | null>(this.readSession());

  /** Usuario actual; null si no ingresó o si lo desactivaron. */
  readonly user = computed<PanelUser | null>(() => {
    const id = this.userId();
    const found = id ? this.users.getById(id) : undefined;
    return found && found.active ? found : null;
  });

  readonly role = computed<Role | null>(() => this.user()?.role ?? null);

  can(permission: Permission): boolean {
    const role = this.role();
    return !!role && roleCan(role, permission);
  }

  /** Puede editar esta propiedad: todas (titular) o solo las que tiene a cargo (agente). */
  canEdit(property: Property): boolean {
    if (this.can('propiedades.editar.todas')) return true;
    const user = this.user();
    return !!user && this.can('propiedades.editar.propias') && property.agentId === user.id;
  }

  async login(email: string, password: string): Promise<string | null> {
    const user = this.users.findByEmail(email);
    const hash = await hashPassword(password);
    if (!user || user.passwordHash !== hash) return 'Email o clave incorrectos.';
    if (!user.active) return 'Este usuario está desactivado. Consultá con la titular.';
    this.userId.set(user.id);
    try {
      sessionStorage.setItem(SESSION_KEY, user.id);
    } catch {
      /* la sesión queda solo en memoria */
    }
    return null;
  }

  logout(): void {
    this.userId.set(null);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* nada que limpiar */
    }
    void this.router.navigate(['/panel/ingresar']);
  }

  private readSession(): string | null {
    try {
      return sessionStorage.getItem(SESSION_KEY);
    } catch {
      return null;
    }
  }
}
