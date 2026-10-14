import { Injectable, signal } from '@angular/core';

export type DialogOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Acción que borra o no se puede deshacer: el botón se pinta de rojo. */
  danger?: boolean;
  /** Si está, el diálogo pide un texto (por ejemplo, una clave) y devuelve lo escrito. */
  input?: { label: string; type?: 'text' | 'password'; placeholder?: string; minLength?: number };
};

export type OpenDialog = DialogOptions & { id: number; resolve: (value: string | boolean | null) => void };

/** Diálogos de confirmación propios de la aplicación (reemplazan a los `confirm` y `prompt` del navegador). */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private nextId = 1;
  readonly current = signal<OpenDialog | null>(null);

  /** Pregunta sí o no. */
  confirm(options: DialogOptions): Promise<boolean> {
    return this.open(options).then((value) => value === true);
  }

  /** Pide un texto; devuelve `null` si se cancela. */
  ask(options: DialogOptions & { input: NonNullable<DialogOptions['input']> }): Promise<string | null> {
    return this.open(options).then((value) => (typeof value === 'string' ? value : null));
  }

  /** Cierra el diálogo con una respuesta. */
  close(value: string | boolean | null): void {
    const dialog = this.current();
    this.current.set(null);
    dialog?.resolve(value);
  }

  private open(options: DialogOptions): Promise<string | boolean | null> {
    // Si ya había uno abierto se lo cancela: nunca se apilan.
    this.current()?.resolve(null);
    return new Promise((resolve) => {
      this.current.set({ ...options, id: this.nextId++, resolve });
    });
  }
}
