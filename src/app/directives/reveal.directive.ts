import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  inject,
} from '@angular/core';

@Directive({
  selector: '[appReveal]',
  standalone: true,
})
export class RevealDirective implements AfterViewInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;
  private fallback?: number;

  @Input('appRevealDelay') delay = 0;

  ngAfterViewInit() {
    const node = this.el.nativeElement;
    node.classList.add('reveal');
    node.style.transitionDelay = `${this.delay}ms`;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    node.classList.add('will-animate');
    const show = () => node.classList.add('in-view');
    this.fallback = window.setTimeout(show, 900);

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          show();
          if (this.fallback) window.clearTimeout(this.fallback);
          this.observer?.unobserve(node);
        }
      },
      { threshold: 0.08 }
    );
    this.observer.observe(node);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
    if (this.fallback) window.clearTimeout(this.fallback);
  }
}
