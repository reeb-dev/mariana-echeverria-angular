import { Injectable, signal } from '@angular/core';

export type Toast = {
  id: number;
  message: string;
  /** Texto del botón de acción (por ejemplo «Deshacer»). */
  actionLabel?: string;
  action?: () => void;
};

/** Avisos breves en pantalla, con una acción opcional (típicamente «Deshacer»). */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  readonly toasts = signal<Toast[]>([]);

  /** Muestra un aviso. Dura 7 segundos si tiene acción y 4 si no. */
  show(message: string, options: { actionLabel?: string; action?: () => void; durationMs?: number } = {}): number {
    const id = this.nextId++;
    const toast: Toast = { id, message, actionLabel: options.actionLabel, action: options.action };
    // Se muestran como mucho tres a la vez: el más viejo sale.
    this.toasts.update((list) => [...list, toast].slice(-3));
    const duration = options.durationMs ?? (options.action ? 7000 : 4000);
    this.timers.set(
      id,
      setTimeout(() => this.dismiss(id), duration)
    );
    return id;
  }

  /** Ejecuta la acción del aviso y lo cierra. */
  runAction(id: number): void {
    const toast = this.toasts().find((t) => t.id === id);
    this.dismiss(id);
    toast?.action?.();
  }

  dismiss(id: number): void {
    const timer = this.timers.get(id);
    if (timer) clearTimeout(timer);
    this.timers.delete(id);
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
