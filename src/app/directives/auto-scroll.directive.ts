import { Directive, ElementRef, NgZone, OnDestroy, OnInit, inject, input } from '@angular/core';

/**
 * Carrusel automático: cada tanto avanza una tarjeta y al llegar al final vuelve al principio.
 * Se detiene mientras la persona lo toca, lo mira con el mouse o tiene el foco adentro, cuando
 * la pestaña está en segundo plano y si el sistema pide menos movimiento.
 */
@Directive({ selector: '[appAutoScroll]', standalone: true })
export class AutoScrollDirective implements OnInit, OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);

  /** Milisegundos entre cada avance. */
  readonly appAutoScroll = input<number | ''>(4500);

  private timer: ReturnType<typeof setInterval> | null = null;
  private paused = false;
  private resumeAt = 0;
  private readonly pause = () => (this.paused = true);
  private readonly resume = () => {
    this.paused = false;
    // Tras tocarlo, se espera un rato antes de seguir solo.
    this.resumeAt = Date.now() + 6000;
  };

  ngOnInit() {
    if (typeof window === 'undefined' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const host = this.el.nativeElement;
    for (const type of ['mouseenter', 'focusin', 'touchstart', 'pointerdown']) host.addEventListener(type, this.pause, { passive: true });
    for (const type of ['mouseleave', 'focusout', 'touchend', 'pointerup', 'touchcancel']) host.addEventListener(type, this.resume, { passive: true });
    const every = Number(this.appAutoScroll()) || 4500;
    this.zone.runOutsideAngular(() => {
      this.timer = setInterval(() => this.tick(), every);
    });
  }

  private tick() {
    const host = this.el.nativeElement;
    if (this.paused || document.hidden || Date.now() < this.resumeAt) return;
    if (host.scrollWidth <= host.clientWidth + 4) return; // todo entra: no hay nada que mover
    const first = host.firstElementChild as HTMLElement | null;
    const step = first ? first.getBoundingClientRect().width + 20 : host.clientWidth * 0.8;
    const atEnd = host.scrollLeft + host.clientWidth >= host.scrollWidth - 4;
    host.scrollTo({ left: atEnd ? 0 : host.scrollLeft + step, behavior: 'smooth' });
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
    const host = this.el.nativeElement;
    for (const type of ['mouseenter', 'focusin', 'touchstart', 'pointerdown']) host.removeEventListener(type, this.pause);
    for (const type of ['mouseleave', 'focusout', 'touchend', 'pointerup', 'touchcancel']) host.removeEventListener(type, this.resume);
  }
}
