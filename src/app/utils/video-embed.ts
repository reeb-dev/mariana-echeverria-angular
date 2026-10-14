/** Videos que se pueden mostrar en una propiedad: YouTube (incluidos Shorts) e Instagram (reels y publicaciones). */
export type VideoEmbed = {
  kind: 'youtube' | 'instagram';
  /** Dirección para el `iframe`, armada solo con el identificador validado. */
  embedUrl: string;
  /** Dirección original, para abrirlo en la app si el embed no carga. */
  watchUrl: string;
  /** Los reels de Instagram y los Shorts son verticales. */
  vertical: boolean;
};

const ID = /^[A-Za-z0-9_-]{5,20}$/;

/** Devuelve los datos para mostrar el video, o `null` si el enlace no es de YouTube ni de Instagram. */
export function parseVideo(input: string | undefined | null): VideoEmbed | null {
  const raw = (input ?? '').trim();
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www|m)\./, '').toLowerCase();
  const parts = url.pathname.split('/').filter(Boolean);

  if (host === 'youtu.be' && parts[0] && ID.test(parts[0])) return youtube(parts[0], false);
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (parts[0] === 'watch') {
      const id = url.searchParams.get('v') ?? '';
      return ID.test(id) ? youtube(id, false) : null;
    }
    if ((parts[0] === 'shorts' || parts[0] === 'embed' || parts[0] === 'live') && ID.test(parts[1] ?? '')) {
      return youtube(parts[1], parts[0] === 'shorts');
    }
    return null;
  }
  if (host === 'instagram.com') {
    // /reel/ID/, /p/ID/, /tv/ID/ (y, con usuario adelante: /usuario/reel/ID/)
    const at = parts.findIndex((p) => p === 'reel' || p === 'reels' || p === 'p' || p === 'tv');
    if (at >= 0 && ID.test(parts[at + 1] ?? '')) {
      const kind = parts[at] === 'reels' ? 'reel' : parts[at];
      const id = parts[at + 1];
      return {
        kind: 'instagram',
        embedUrl: `https://www.instagram.com/${kind}/${id}/embed`,
        watchUrl: `https://www.instagram.com/${kind}/${id}/`,
        vertical: true,
      };
    }
  }
  return null;
}

function youtube(id: string, vertical: boolean): VideoEmbed {
  return {
    kind: 'youtube',
    embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
    watchUrl: `https://www.youtube.com/watch?v=${id}`,
    vertical,
  };
}
