/**
 * Piezas para redes armadas en el navegador, con las fotos de la propiedad:
 * imágenes para publicación (cuadrada) e historia (vertical) y un video tipo reel.
 * No sale nada del navegador: todo se dibuja en un canvas.
 */

export type MediaInput = {
  /** Direcciones de las fotos, ya resueltas (con la base de la aplicación). */
  photos: string[];
  title: string;
  location: string;
  priceLabel: string;
  operation: 'venta' | 'alquiler';
  /** Línea corta: «180 m² · 3 dorm. · 2 baños». */
  facts: string;
  phone: string;
  /** Dirección del logo ya resuelta. */
  logoUrl: string;
  brand: string;
};

const GOLD = '#e0b040';
const ORANGE = '#e8873a';
const DARK = '#1c1612';

export function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Dibuja la imagen llenando el rectángulo (recorte centrado), con un zoom opcional. */
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number, zoom = 1, shiftX = 0) {
  const scale = Math.max(w / img.width, h / img.height) * zoom;
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = x + (w - dw) / 2 + shiftX;
  const dy = y + (h - dh) / 2;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = kept[maxLines - 1].replace(/[\s,.;:–-]*$/, '') + '…';
    return kept;
  }
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Texto superpuesto común: etiqueta de operación, título, ubicación, datos y precio. */
function drawOverlay(ctx: CanvasRenderingContext2D, input: MediaInput, w: number, h: number, bottom: number) {
  const pad = w * 0.07;
  const grad = ctx.createLinearGradient(0, h * 0.35, 0, h);
  grad.addColorStop(0, 'rgba(28,22,18,0)');
  grad.addColorStop(1, 'rgba(28,22,18,0.92)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, h * 0.35, w, h * 0.65);

  // etiqueta
  const tag = input.operation === 'alquiler' ? 'ALQUILER' : 'VENTA';
  ctx.font = `700 ${Math.round(w * 0.032)}px Helvetica, Arial, sans-serif`;
  const tagW = ctx.measureText(tag).width + w * 0.06;
  const tagH = w * 0.07;
  let y = bottom;

  // precio
  ctx.fillStyle = GOLD;
  ctx.font = `600 ${Math.round(w * 0.085)}px Georgia, 'Times New Roman', serif`;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(input.priceLabel, pad, y);
  y -= w * 0.1;

  // datos
  if (input.facts) {
    ctx.fillStyle = 'rgba(255,255,255,0.82)';
    ctx.font = `500 ${Math.round(w * 0.036)}px Helvetica, Arial, sans-serif`;
    ctx.fillText(input.facts, pad, y);
    y -= w * 0.06;
  }

  // ubicación
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = `500 ${Math.round(w * 0.04)}px Helvetica, Arial, sans-serif`;
  ctx.fillText(input.location, pad, y);
  y -= w * 0.075;

  // título
  ctx.fillStyle = '#fff';
  ctx.font = `600 ${Math.round(w * 0.066)}px Georgia, 'Times New Roman', serif`;
  const lines = wrapLines(ctx, input.title, w - pad * 2, 3);
  const lineH = w * 0.078;
  for (let i = lines.length - 1; i >= 0; i--) {
    ctx.fillText(lines[i], pad, y);
    y -= lineH;
  }
  y -= w * 0.01;

  // chip de operación
  ctx.fillStyle = ORANGE;
  roundRect(ctx, pad, y - tagH, tagW, tagH, tagH / 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = `700 ${Math.round(w * 0.032)}px Helvetica, Arial, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.fillText(tag, pad + w * 0.03, y - tagH / 2 + 1);
  ctx.textBaseline = 'alphabetic';
}

function drawLogo(ctx: CanvasRenderingContext2D, logo: HTMLImageElement | null, x: number, y: number, width: number) {
  if (!logo) return;
  const h = (logo.naturalHeight / logo.naturalWidth) * width;
  ctx.save();
  ctx.fillStyle = 'rgba(20,20,20,0.5)';
  roundRect(ctx, x - width * 0.04, y - h * 0.3, width * 1.08, h * 1.6, h * 0.35);
  ctx.fill();
  ctx.drawImage(logo, x, y, width, h);
  ctx.restore();
}

/** Imagen fija para publicar: cuadrada (feed) o vertical (historia / portada de reel). */
export async function renderStill(input: MediaInput, format: 'post' | 'story'): Promise<Blob> {
  const w = 1080;
  const h = format === 'post' ? 1080 : 1920;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = DARK;
  ctx.fillRect(0, 0, w, h);
  const [photo, logo] = await Promise.all([loadImage(input.photos[0] ?? ''), loadImage(input.logoUrl)]);
  if (photo) drawCover(ctx, photo, 0, 0, w, h);
  drawLogo(ctx, logo, w * 0.07, h * 0.04, w * 0.42);
  drawOverlay(ctx, input, w, h, h - (format === 'post' ? w * 0.14 : h * 0.1));
  // pie
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = `500 ${Math.round(w * 0.032)}px Helvetica, Arial, sans-serif`;
  ctx.fillText(`${input.brand} · ${input.phone}`, w * 0.07, h - w * 0.05);
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('canvas'))), 'image/png')
  );
}

export type ReelResult = { blob: Blob; extension: 'mp4' | 'webm'; seconds: number };

/** Video vertical 1080×1920: las fotos con zoom suave, los datos arriba y una tarjeta final con el contacto. */
export async function renderReel(input: MediaInput, onProgress: (ratio: number) => void): Promise<ReelResult> {
  if (typeof MediaRecorder === 'undefined') throw new Error('Este navegador no puede grabar video.');
  const w = 1080;
  const h = 1920;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const urls = input.photos.slice(0, 6);
  const [logo, ...loaded] = await Promise.all([loadImage(input.logoUrl), ...urls.map((u) => loadImage(u))]);
  const images = loaded.filter((i): i is HTMLImageElement => !!i);
  if (images.length === 0) throw new Error('La propiedad no tiene fotos para armar el video.');

  const PER = 2.6; // segundos por foto
  const FADE = 0.55;
  const END = 2.8;
  const total = images.length * PER + END;

  const mime = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find((t) =>
    MediaRecorder.isTypeSupported(t)
  );
  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6_000_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
  const stopped = new Promise<void>((resolve) => (recorder.onstop = () => resolve()));

  const frame = (t: number) => {
    ctx.fillStyle = DARK;
    ctx.fillRect(0, 0, w, h);
    if (t < images.length * PER) {
      const i = Math.min(images.length - 1, Math.floor(t / PER));
      const local = t - i * PER;
      const zoomOf = (n: number, s: number) => 1.04 + 0.1 * Math.min(1, s / PER) * (n % 2 === 0 ? 1 : 0.8);
      drawCover(ctx, images[i], 0, 0, w, h, zoomOf(i, local), (i % 2 === 0 ? -1 : 1) * local * 6);
      // fundido desde la foto anterior
      if (i > 0 && local < FADE) {
        ctx.globalAlpha = 1 - local / FADE;
        drawCover(ctx, images[i - 1], 0, 0, w, h, zoomOf(i - 1, PER), (i % 2 === 1 ? -1 : 1) * PER * 6);
        ctx.globalAlpha = 1;
      }
      drawLogo(ctx, logo, w * 0.07, h * 0.035, w * 0.42);
      drawOverlay(ctx, input, w, h, h - h * 0.1);
    } else {
      // tarjeta final
      const local = t - images.length * PER;
      const a = Math.min(1, local / 0.5);
      ctx.globalAlpha = a;
      if (logo) {
        const lw = w * 0.7;
        ctx.drawImage(logo, (w - lw) / 2, h * 0.3, lw, (logo.naturalHeight / logo.naturalWidth) * lw);
      }
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.font = `600 ${Math.round(w * 0.065)}px Georgia, 'Times New Roman', serif`;
      ctx.fillText('Consultá por esta propiedad', w / 2, h * 0.52);
      ctx.fillStyle = GOLD;
      ctx.font = `700 ${Math.round(w * 0.08)}px Helvetica, Arial, sans-serif`;
      ctx.fillText(input.phone, w / 2, h * 0.6);
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = `500 ${Math.round(w * 0.04)}px Helvetica, Arial, sans-serif`;
      ctx.fillText(input.location, w / 2, h * 0.67);
      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
    }
  };

  frame(0);
  recorder.start(250);
  const startedAt = performance.now();
  await new Promise<void>((resolve) => {
    const tick = () => {
      const t = (performance.now() - startedAt) / 1000;
      if (t >= total) {
        frame(total - 0.001);
        resolve();
        return;
      }
      frame(t);
      onProgress(t / total);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  recorder.stop();
  await stopped;
  onProgress(1);
  const type = recorder.mimeType || mime || 'video/webm';
  return { blob: new Blob(chunks, { type }), extension: type.includes('mp4') ? 'mp4' : 'webm', seconds: Math.round(total) };
}
