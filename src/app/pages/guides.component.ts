import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GUIDES } from '../data/guides';
import { CONTACT } from '../data/properties';
import { SeoService } from '../utils/seo.service';

/** Índice de guías. */
@Component({
  selector: 'app-guides',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="mx-auto max-w-5xl px-5 pt-[8.5rem] pb-24 md:px-8 md:pt-[9.5rem]">
      <a routerLink="/" class="text-sm text-muted-foreground transition hover:text-forest">← Volver al sitio</a>
      <p class="eyebrow mt-8 text-forest">Guías</p>
      <h1 class="section-title mt-3 text-4xl text-forest-deep md:text-5xl">Lo que conviene saber antes de operar</h1>
      <p class="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
        Respuestas claras a las dudas que más escuchamos al comprar, vender o heredar una propiedad.
      </p>
      <ul class="mt-12 grid gap-6 md:grid-cols-3">
        @for (g of guides; track g.slug) {
          <li class="h-full">
            <a [routerLink]="['/guias', g.slug]" class="mer-card mer-card-link mer-card-accent flex h-full flex-col p-6">
              <p class="text-xs tracking-[0.14em] text-forest uppercase">{{ g.minutes }} min de lectura</p>
              <h2 class="mt-3 font-display text-xl font-medium leading-snug text-forest-deep">{{ g.title }}</h2>
              <p class="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{{ g.description }}</p>
              <span class="mt-5 text-sm font-semibold text-forest">Leer la guía →</span>
            </a>
          </li>
        }
      </ul>
    </div>
  `,
})
export class GuidesComponent {
  readonly guides = GUIDES;

  constructor() {
    inject(SeoService).set({
      title: 'Guías para comprar, vender y heredar una propiedad | Mariana Echeverría Bienes Raíces',
      description: 'Qué papeles hacen falta para vender, cómo es una sucesión con una propiedad y qué gastos tiene una operación.',
    });
  }
}

/** Una guía. */
@Component({
  selector: 'app-guide',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article class="mx-auto max-w-3xl px-5 pt-[8.5rem] pb-24 md:px-8 md:pt-[9.5rem]">
      @if (guide(); as g) {
        <nav aria-label="Ubicación en el sitio" class="text-sm text-muted-foreground">
          <a routerLink="/guias" class="transition hover:text-forest">← Todas las guías</a>
        </nav>
        <p class="eyebrow mt-8 text-forest">{{ g.minutes }} min de lectura</p>
        <h1 class="section-title mt-3 text-3xl text-forest-deep md:text-4xl">{{ g.title }}</h1>
        <p class="mt-5 text-lg leading-relaxed text-muted-foreground">{{ g.intro }}</p>

        @for (s of g.sections; track s.heading) {
          <section class="mt-10">
            <h2 class="font-display text-2xl font-medium text-forest-deep">{{ s.heading }}</h2>
            @for (p of s.paragraphs ?? []; track p) {
              <p class="mt-3 leading-[1.75] text-foreground/85">{{ p }}</p>
            }
            @if (s.list?.length) {
              <ul class="mt-4 space-y-2.5">
                @for (item of s.list; track item) {
                  <li class="flex gap-3 leading-relaxed">
                    <svg viewBox="0 0 24 24" class="mt-1 h-4 w-4 shrink-0 text-forest" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    {{ item }}
                  </li>
                }
              </ul>
            }
          </section>
        }

        <p class="mt-10 rounded-xl border border-border bg-mist px-4 py-3 text-sm text-muted-foreground">
          Información general y orientativa: cada caso es distinto y no reemplaza el asesoramiento profesional.
        </p>

        <section class="mer-card mer-card-accent mt-10 flex flex-wrap items-center justify-between gap-5 p-6">
          <div class="max-w-md">
            <p class="font-display text-xl font-medium text-forest-deep">¿Querés que lo revisemos con tu caso?</p>
            <p class="mt-1 text-sm text-muted-foreground">{{ contact.matricula }} · Abogada y corredora inmobiliaria.</p>
          </div>
          <a [href]="contact.whatsappUrl" target="_blank" rel="noopener noreferrer"
             class="inline-flex h-11 items-center rounded-lg bg-stone-warm px-6 text-sm font-semibold text-forest-deep transition hover:bg-[#e8c056]">
            Consultar por WhatsApp
          </a>
        </section>
      } @else {
        <h1 class="section-title text-3xl text-forest-deep">Guía no encontrada</h1>
        <a routerLink="/guias" class="mt-4 inline-block text-forest underline">Ver todas las guías</a>
      }
    </article>
  `,
})
export class GuideComponent {
  private readonly route = inject(ActivatedRoute);
  readonly contact = CONTACT;
  readonly guide = computed(() => GUIDES.find((g) => g.slug === this.route.snapshot.paramMap.get('slug')) ?? null);

  constructor() {
    const g = this.guide();
    inject(SeoService).set(
      g
        ? {
            title: `${g.title} | Mariana Echeverría Bienes Raíces`,
            description: g.description,
            jsonLd: {
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: g.title,
              description: g.description,
              author: { '@type': 'Person', name: 'Mariana Laura Echeverría' },
            },
          }
        : { title: 'Guía no encontrada | Mariana Echeverría Bienes Raíces', description: 'La guía no está disponible.' }
    );
  }
}
