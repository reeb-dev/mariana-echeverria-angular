import { Component, input } from '@angular/core';
import { AssetUrlPipe } from '../utils/asset-url';

/**
 * Marca de agua de la inmobiliaria sobre una foto. Es una capa visual (no cambia el archivo): sirve para las fotos que
 * todavía no la traen incorporada. Las que se suben desde el panel la llevan dentro de la imagen.
 */
@Component({
  selector: 'app-watermark',
  standalone: true,
  imports: [AssetUrlPipe],
  template: `
    <span
      class="pointer-events-none absolute z-[2] select-none rounded-lg bg-black/55 p-1.5 backdrop-blur-[1px]"
      [class]="positionClass()"
      aria-hidden="true"
    >
      <img [src]="'/about/logo-nav.png' | assetUrl" alt="" class="block h-6 w-auto sm:h-7" />
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
