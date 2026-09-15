import { Location } from '@angular/common';
import { Pipe, PipeTransform, inject } from '@angular/core';

/**
 * Prefix app-root asset paths with the deploy base href.
 * Absolute paths like `/properties/...` break on GitHub Pages
 * (`/mariana-echeverria-angular/`) because the browser resolves them at domain root.
 */
export function resolveAssetUrl(
  path: string,
  prepareExternalUrl: (url: string) => string
): string {
  if (!path || /^(https?:|data:|blob:)/i.test(path)) {
    return path;
  }
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return prepareExternalUrl(normalized);
}

@Pipe({ name: 'assetUrl', standalone: true, pure: true })
export class AssetUrlPipe implements PipeTransform {
  private readonly location = inject(Location);

  transform(path: string | null | undefined): string {
    if (!path) {
      return '';
    }
    return resolveAssetUrl(path, (url) => this.location.prepareExternalUrl(url));
  }
}
