import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser';
import { parseVideo } from '../utils/video-embed';

/** Reproductor incrustado de YouTube o Instagram a partir del enlace cargado en la propiedad. */
@Component({
  selector: 'app-video-embed',
  standalone: true,
  template: `
    @if (video(); as v) {
      <div [class]="v.vertical ? verticalBox : wideBox">
        <iframe
          [src]="safeUrl()!"
          class="h-full w-full"
          [title]="title()"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowfullscreen
          referrerpolicy="strict-origin-when-cross-origin"
        ></iframe>
      </div>
      <p class="mt-2 text-xs text-muted-foreground">
        ¿No se ve?
        <a [href]="v.watchUrl" target="_blank" rel="noopener noreferrer" class="text-forest underline">
          Abrilo en {{ v.kind === 'youtube' ? 'YouTube' : 'Instagram' }}
        </a>
      </p>
    }
  `,
})
export class VideoEmbedComponent {
  private readonly sanitizer = inject(DomSanitizer);
  readonly url = input<string | undefined>();
  readonly title = input('Video de la propiedad');

  readonly wideBox = 'aspect-video overflow-hidden rounded-2xl border border-border bg-black';
  readonly verticalBox = 'mx-auto aspect-[9/16] max-h-[40rem] max-w-sm overflow-hidden rounded-2xl border border-border bg-black';

  readonly video = computed(() => parseVideo(this.url()));
  /** Solo se confía en direcciones armadas por `parseVideo` (identificador validado, dominio fijo). */
  readonly safeUrl = computed<SafeResourceUrl | null>(() => {
    const v = this.video();
    return v ? this.sanitizer.bypassSecurityTrustResourceUrl(v.embedUrl) : null;
  });
}
