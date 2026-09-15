import { Component, HostListener, Input, signal } from '@angular/core';
import { PropertyPhoto } from '../data/properties';

@Component({
  selector: 'app-property-gallery',
  standalone: true,
  template: `
    <div class="space-y-4">
      <div class="relative aspect-[16/10] overflow-hidden bg-mist md:aspect-[16/9]">
        <img
          [src]="current().src"
          [alt]="current().alt"
          class="h-full w-full object-cover"
        />
        <div
          class="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-forest-deep/85 to-transparent p-4 pt-16 text-white"
        >
          <div>
            <p class="text-sm font-medium">{{ current().caption }}</p>
            <p class="text-xs text-white/70">
              Foto {{ active() + 1 }} de {{ photos.length }} · {{ title }}
            </p>
          </div>
          <div class="flex gap-2">
            <button
              type="button"
              class="rounded-md border border-white/35 bg-white/10 px-3 py-1.5 text-sm backdrop-blur-sm hover:bg-white/20"
              aria-label="Foto anterior"
              (click)="go(-1)"
            >
              ←
            </button>
            <button
              type="button"
              class="rounded-md border border-white/35 bg-white/10 px-3 py-1.5 text-sm backdrop-blur-sm hover:bg-white/20"
              aria-label="Foto siguiente"
              (click)="go(1)"
            >
              →
            </button>
          </div>
        </div>
      </div>

      <ul class="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        @for (photo of photos; track photo.src; let i = $index) {
          <li>
            <button
              type="button"
              class="relative aspect-[4/3] w-full overflow-hidden ring-offset-2 transition"
              [class.ring-2]="i === active()"
              [class.ring-forest]="i === active()"
              [class.opacity-80]="i !== active()"
              [attr.aria-label]="'Ver ' + photo.caption"
              [attr.aria-current]="i === active()"
              (click)="active.set(i)"
            >
              <img [src]="photo.src" [alt]="photo.alt" class="h-full w-full object-cover" />
            </button>
          </li>
        }
      </ul>
    </div>
  `,
})
export class PropertyGalleryComponent {
  @Input({ required: true }) photos: PropertyPhoto[] = [];
  @Input({ required: true }) title = '';

  readonly active = signal(0);

  current() {
    return this.photos[this.active()] ?? this.photos[0];
  }

  go(dir: -1 | 1) {
    const len = this.photos.length;
    this.active.update((i) => (i + dir + len) % len);
  }

  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') this.go(-1);
    if (e.key === 'ArrowRight') this.go(1);
  }
}
