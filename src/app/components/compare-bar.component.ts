import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CompareService, MAX_COMPARE } from '../data/compare.service';

/** Barra fija abajo con las propiedades elegidas para comparar. */
@Component({
  selector: 'app-compare-bar',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (compare.all().length > 0) {
      <div class="fixed inset-x-0 bottom-20 z-[80] flex justify-center px-4 md:bottom-5">
        <div class="flex w-full max-w-md items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 text-sm shadow-card">
          <span class="min-w-0 flex-1 text-forest-deep">
            <strong>{{ compare.all().length }}</strong> de {{ max }} para comparar
          </span>
          <button type="button" class="text-muted-foreground transition hover:text-forest" (click)="compare.clear()">Vaciar</button>
          <a
            routerLink="/comparar"
            class="inline-flex h-9 items-center rounded-lg bg-forest-deep px-4 font-semibold text-stone-warm transition hover:bg-forest hover:text-white"
          >
            Comparar
          </a>
        </div>
      </div>
    }
  `,
})
export class CompareBarComponent {
  readonly compare = inject(CompareService);
  readonly max = MAX_COMPARE;
}
