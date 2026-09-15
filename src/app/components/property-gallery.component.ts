import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  ViewChild,
  signal,
} from '@angular/core';
import { PropertyPhoto } from '../data/properties';

@Component({
  selector: 'app-property-gallery',
  standalone: true,
  template: `
    <div class="space-y-4">
      <div class="relative aspect-[16/10] overflow-hidden bg-mist md:aspect-[16/9]">
        <button
          type="button"
          class="group relative block h-full w-full cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
          [attr.aria-label]="'Ampliar foto: ' + current().caption"
          (click)="openLightbox(active())"
        >
          <img
            [src]="current().src"
            [alt]="current().alt"
            class="h-full w-full object-cover transition duration-500 ease-premium group-hover:scale-[1.02]"
          />
          <span
            class="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-forest-deep/85 to-transparent p-4 pt-16 text-left text-white"
          >
            <span>
              <span class="block text-sm font-medium">{{ current().caption }}</span>
              <span class="mt-0.5 block text-xs text-white/70">
                Foto {{ active() + 1 }} de {{ photos.length }} · {{ title }}
              </span>
            </span>
            <span
              class="rounded-md border border-white/35 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-sm"
            >
              Ver ampliada
            </span>
          </span>
        </button>

        <div class="absolute top-3 right-3 flex gap-2">
          <button
            type="button"
            class="rounded-md border border-white/35 bg-forest-deep/55 px-3 py-1.5 text-sm text-white backdrop-blur-sm hover:bg-forest-deep/75"
            aria-label="Foto anterior"
            (click)="go(-1); $event.stopPropagation()"
          >
            ←
          </button>
          <button
            type="button"
            class="rounded-md border border-white/35 bg-forest-deep/55 px-3 py-1.5 text-sm text-white backdrop-blur-sm hover:bg-forest-deep/75"
            aria-label="Foto siguiente"
            (click)="go(1); $event.stopPropagation()"
          >
            →
          </button>
        </div>
      </div>

      <ul class="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        @for (photo of photos; track photo.src; let i = $index) {
          <li>
            <button
              type="button"
              class="relative aspect-[4/3] w-full overflow-hidden ring-offset-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
              [class.ring-2]="i === active()"
              [class.ring-forest]="i === active()"
              [class.opacity-80]="i !== active()"
              [attr.aria-label]="'Ampliar: ' + photo.caption"
              [attr.aria-current]="i === active() ? 'true' : null"
              (click)="openLightbox(i)"
            >
              <img [src]="photo.src" [alt]="photo.alt" class="h-full w-full object-cover" />
            </button>
          </li>
        }
      </ul>
    </div>

    @if (lightboxOpen()) {
      <div
        class="animate-soft-fade fixed inset-0 z-[100] flex flex-col bg-forest-deep/92"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="'Galería ampliada: ' + title"
        (click)="closeLightbox()"
      >
        <div
          class="flex shrink-0 items-center justify-between gap-3 px-4 py-3 text-white sm:px-6"
          (click)="$event.stopPropagation()"
        >
          <p class="min-w-0 truncate text-sm">
            <span class="font-medium">{{ current().caption }}</span>
            <span class="ml-2 text-white/65">
              {{ active() + 1 }} / {{ photos.length }}
            </span>
          </p>
          <button
            #closeBtn
            type="button"
            class="shrink-0 rounded-md border border-white/30 bg-white/10 px-3 py-2 text-sm hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-warm"
            aria-label="Cerrar vista ampliada"
            (click)="closeLightbox()"
          >
            Cerrar ✕
          </button>
        </div>

        <div
          class="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-4 sm:px-14"
          (click)="$event.stopPropagation()"
        >
          <button
            type="button"
            class="absolute left-2 z-10 hidden h-11 w-11 items-center justify-center rounded-md border border-white/30 bg-white/10 text-lg text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-warm sm:flex"
            aria-label="Foto anterior"
            (click)="go(-1)"
          >
            ←
          </button>

          <img
            [src]="current().src"
            [alt]="current().alt"
            class="max-h-full max-w-full object-contain select-none"
            draggable="false"
          />

          <button
            type="button"
            class="absolute right-2 z-10 hidden h-11 w-11 items-center justify-center rounded-md border border-white/30 bg-white/10 text-lg text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-warm sm:flex"
            aria-label="Foto siguiente"
            (click)="go(1)"
          >
            →
          </button>
        </div>

        <div
          class="flex shrink-0 items-center justify-center gap-3 px-4 pb-5 sm:hidden"
          (click)="$event.stopPropagation()"
        >
          <button
            type="button"
            class="h-11 flex-1 rounded-md border border-white/30 bg-white/10 text-sm text-white hover:bg-white/20"
            aria-label="Foto anterior"
            (click)="go(-1)"
          >
            ← Anterior
          </button>
          <button
            type="button"
            class="h-11 flex-1 rounded-md border border-white/30 bg-white/10 text-sm text-white hover:bg-white/20"
            aria-label="Foto siguiente"
            (click)="go(1)"
          >
            Siguiente →
          </button>
        </div>
      </div>
    }
  `,
})
export class PropertyGalleryComponent implements OnDestroy {
  @Input({ required: true }) photos: PropertyPhoto[] = [];
  @Input({ required: true }) title = '';

  @ViewChild('closeBtn') closeBtn?: ElementRef<HTMLButtonElement>;

  readonly active = signal(0);
  readonly lightboxOpen = signal(false);

  private previousOverflow = '';
  private restoreFocusEl: HTMLElement | null = null;

  ngOnDestroy() {
    if (this.lightboxOpen()) {
      document.body.style.overflow = this.previousOverflow;
    }
  }

  current() {
    return this.photos[this.active()] ?? this.photos[0];
  }

  go(dir: -1 | 1) {
    const len = this.photos.length;
    if (!len) return;
    this.active.update((i) => (i + dir + len) % len);
  }

  openLightbox(index: number) {
    this.restoreFocusEl = document.activeElement as HTMLElement | null;
    this.active.set(index);
    this.lightboxOpen.set(true);
    this.previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    queueMicrotask(() => this.closeBtn?.nativeElement.focus());
  }

  closeLightbox() {
    if (!this.lightboxOpen()) return;
    this.lightboxOpen.set(false);
    document.body.style.overflow = this.previousOverflow;
    queueMicrotask(() => this.restoreFocusEl?.focus());
  }

  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (this.lightboxOpen()) {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.closeLightbox();
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.go(-1);
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.go(1);
        return;
      }
      if (e.key === 'Tab') {
        this.trapFocus(e);
      }
      return;
    }

    if (e.key === 'ArrowLeft') this.go(-1);
    if (e.key === 'ArrowRight') this.go(1);
  }

  private trapFocus(e: KeyboardEvent) {
    const root = (e.target as HTMLElement | null)?.closest('[role="dialog"]');
    if (!root) return;
    const focusable = Array.from(
      root.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);

    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }
}
