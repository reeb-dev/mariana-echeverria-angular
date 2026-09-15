import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CONTACT } from '../data/properties';

export type BrandLogoTone = 'on-dark' | 'on-light';
export type BrandLogoSize = 'sm' | 'md' | 'lg' | 'hero';

@Component({
  selector: 'app-brand-logo',
  standalone: true,
  imports: [NgClass],
  template: `
    <span
      class="inline-flex items-center gap-3"
      [ngClass]="rootClass"
      [attr.aria-label]="ariaLabel"
      role="img"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 80 100"
        fill="none"
        class="shrink-0"
        [ngClass]="markClass"
        aria-hidden="true"
      >
        <path
          fill="#E0B040"
          fill-rule="evenodd"
          d="M5 38 L34 5 L75 50 L75 95 H5 V38 Z M19 50 L34 28 L61 56 V79 H19 V50 Z"
        />
        <path fill="#D06A28" d="M25 54 L36 36 L49 52 V75 H25 V54 Z" />
      </svg>

      <span class="flex min-w-0 flex-col justify-center leading-none">
        <span
          class="font-heading font-bold uppercase tracking-[0.06em]"
          [ngClass]="[nameClass, nameColor]"
        >
          Mariana Echeverría
        </span>
        <span
          class="mt-[0.35em] font-heading font-semibold uppercase tracking-[0.2em]"
          [ngClass]="[tagClass, tagColor]"
        >
          Bienes Raíces
        </span>
        @if (showMatricula) {
          <span
            class="mt-[0.45em] font-heading font-medium uppercase tracking-[0.14em]"
            [ngClass]="[matClass, matColor]"
          >
            {{ contact.matricula }}
          </span>
        }
      </span>
    </span>
  `,
})
export class BrandLogoComponent {
  readonly contact = CONTACT;

  /** Contraste según fondo: on-dark = texto claro/oro; on-light = naranja/espresso */
  @Input() tone: BrandLogoTone = 'on-dark';
  @Input() size: BrandLogoSize = 'md';
  @Input() showMatricula = false;

  get ariaLabel(): string {
    const base = `${this.contact.brand} ${this.contact.tagline}`;
    return this.showMatricula ? `${base}. ${this.contact.matricula}` : base;
  }

  get rootClass(): string {
    switch (this.size) {
      case 'sm':
        return 'gap-2.5';
      case 'lg':
        return 'gap-3.5';
      case 'hero':
        return 'gap-4 sm:gap-5';
      default:
        return 'gap-3';
    }
  }

  get markClass(): string {
    switch (this.size) {
      case 'sm':
        return 'h-8 w-auto';
      case 'lg':
        return 'h-12 w-auto';
      case 'hero':
        return 'h-11 w-auto sm:h-14 md:h-[4.5rem] lg:h-20';
      default:
        return 'h-10 w-auto sm:h-11';
    }
  }

  get nameClass(): string {
    switch (this.size) {
      case 'sm':
        return 'text-[0.7rem] sm:text-xs';
      case 'lg':
        return 'text-base sm:text-lg';
      case 'hero':
        return 'text-base sm:text-xl md:text-2xl lg:text-[1.75rem]';
      default:
        return 'text-sm sm:text-[0.95rem]';
    }
  }

  get tagClass(): string {
    switch (this.size) {
      case 'sm':
        return 'text-[0.55rem] sm:text-[0.6rem]';
      case 'lg':
        return 'text-[0.7rem] sm:text-xs';
      case 'hero':
        return 'text-[0.55rem] sm:text-xs md:text-sm lg:text-[0.9rem]';
      default:
        return 'text-[0.6rem] sm:text-[0.65rem]';
    }
  }

  get matClass(): string {
    switch (this.size) {
      case 'hero':
        return 'text-[0.55rem] sm:text-xs';
      case 'lg':
        return 'text-[0.6rem]';
      default:
        return 'text-[0.5rem] sm:text-[0.55rem]';
    }
  }

  get nameColor(): string {
    /* on-dark: cream claro sobre hero/zonas oscuras; on-light: terracota sobre crema */
    return this.tone === 'on-dark' ? 'text-[#f7e6c4]' : 'text-clay-deep';
  }

  get tagColor(): string {
    return this.tone === 'on-dark' ? 'text-stone-warm' : 'text-forest';
  }

  get matColor(): string {
    return this.tone === 'on-dark' ? 'text-white/70' : 'text-muted-foreground';
  }
}
