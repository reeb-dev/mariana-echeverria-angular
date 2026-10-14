import { Injectable, signal } from '@angular/core';
import type { Role } from './permissions';

const STORAGE_KEY = 'mer.users.v1';

export type PanelUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  /** SHA-256 con prefijo fijo. Solo para la demo: sin servidor no hay seguridad real. */
  passwordHash: string;
};

export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(`mer-demo:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Usuarios de ejemplo. Las claves están en la pantalla de ingreso de la demo. */
const SEED_USERS: PanelUser[] = [
  {
    id: 'u-titular',
    name: 'Mariana Echeverría',
    email: 'mariana@demo.local',
    role: 'titular',
    active: true,
    passwordHash: '20641de14a6eed8e0e7d417a3920e9a09ea67f57d1c64b76b1a961aae2d271a3',
  },
  {
    id: 'u-agente',
    name: 'Agente de ejemplo',
    email: 'agente@demo.local',
    role: 'agente',
    active: true,
    passwordHash: 'f913f89921065c0643151a348c8416e2ea2c81cf6a4a1665b6441b333bcd7d9a',
  },
  {
    id: 'u-consulta',
    name: 'Usuario de consulta',
    email: 'consulta@demo.local',
    role: 'consulta',
    active: true,
    passwordHash: 'caad424a55459950d57a48809adbbd15eb127e04d96ae138875d4503cf65473e',
  },
];

@Injectable({ providedIn: 'root' })
export class UsersStore {
  private readonly state = signal<PanelUser[]>(this.load());
  readonly all = this.state.asReadonly();

  getById(id: string): PanelUser | undefined {
    return this.state().find((u) => u.id === id);
  }

  findByEmail(email: string): PanelUser | undefined {
    const target = email.trim().toLowerCase();
    return this.state().find((u) => u.email.toLowerCase() === target);
  }

  private activeTitulares(excludingId?: string): number {
    return this.state().filter((u) => u.role === 'titular' && u.active && u.id !== excludingId).length;
  }

  /** Devuelve un mensaje de error o null si salió bien. */
  async create(input: { name: string; email: string; role: Role; password: string }): Promise<string | null> {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    if (!name) return 'Falta el nombre.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'El email no parece válido.';
    if (input.password.length < 8) return 'La clave debe tener al menos 8 caracteres.';
    if (this.findByEmail(email)) return 'Ya existe un usuario con ese email.';
    const user: PanelUser = {
      id: globalThis.crypto?.randomUUID?.() ?? `u-${Date.now().toString(36)}`,
      name,
      email,
      role: input.role,
      active: true,
      passwordHash: await hashPassword(input.password),
    };
    this.commit([...this.state(), user]);
    return null;
  }

  update(id: string, changes: Partial<Pick<PanelUser, 'name' | 'role' | 'active'>>): string | null {
    const current = this.getById(id);
    if (!current) return 'No existe el usuario.';
    const next = { ...current, ...changes };
    const losesTitular =
      current.role === 'titular' && current.active && (next.role !== 'titular' || !next.active);
    if (losesTitular && this.activeTitulares(id) === 0) {
      return 'Tiene que quedar al menos un titular activo.';
    }
    this.commit(this.state().map((u) => (u.id === id ? next : u)));
    return null;
  }

  async resetPassword(id: string, password: string): Promise<string | null> {
    if (password.length < 8) return 'La clave debe tener al menos 8 caracteres.';
    const current = this.getById(id);
    if (!current) return 'No existe el usuario.';
    const passwordHash = await hashPassword(password);
    this.commit(this.state().map((u) => (u.id === id ? { ...u, passwordHash } : u)));
    return null;
  }

  reset(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* sin acceso al almacenamiento */
    }
    this.state.set(SEED_USERS.map((u) => ({ ...u })));
  }

  private load(): PanelUser[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed as PanelUser[];
      }
    } catch {
      /* se usa el ejemplo */
    }
    return SEED_USERS.map((u) => ({ ...u }));
  }

  private commit(next: PanelUser[]): void {
    this.state.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* sin espacio: queda en memoria */
    }
  }
}
