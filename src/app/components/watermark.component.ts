import { Component, input } from '@angular/core';

/**
 * Marca de agua de la inmobiliaria sobre una foto. Es una capa visual (no cambia el archivo): sirve para las fotos que
 * todavía no la traen incorporada. Las que se suben desde el panel la llevan dentro de la imagen.
 */
@Component({
  selector: 'app-watermark',
  standalone: true,
  template: `
    <span
      class="pointer-events-none absolute z-[2] flex select-none items-center gap-1.5 rounded-md bg-black/25 px-2 py-1 text-white/90 backdrop-blur-[1px]"
      [class]="positionClass()"
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" class="h-3.5 w-3.5 shrink-0 text-[#e0b040]" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 11l9-8 9 8v10H3z" />
      </svg>
      <span class="whitespace-nowrap text-[9px] font-semibold tracking-[0.14em] uppercase [text-shadow:0_1px_2px_rgba(0,0,0,.6)]">
        Mariana Echeverría · Bienes Raíces
      </span>
    </span>
  `,
})
export class WatermarkComponent {
  /** Dónde se ubica sobre la foto. */
  readonly position = input<'bottom-center' | 'top-left' | 'bottom-right'>('bottom-right');

  positionClass(): string {
    switch (this.position()) {
      case 'bottom-center':
        return 'bottom-3 left-1/2 -translate-x-1/2';
      case 'top-left':
        return 'top-3 left-3';
      default:
        return 'bottom-3 right-3';
    }
  }
}
