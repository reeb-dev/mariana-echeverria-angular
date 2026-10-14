// Servidor local de redacción de avisos con Claude.
//
//   cd tools/ai-proxy && npm install
//   ANTHROPIC_API_KEY=sk-ant-... npm start
//
// El panel (ng serve) le habla por /api/ai/listing-copy (ver proxy.conf.json).
// La clave vive solo acá, nunca en el navegador. Sin clave responde 503 y el panel usa la plantilla.
import http from 'node:http';
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';

const PORT = Number(process.env.PORT ?? 8787);
const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-opus-5-5';
const MAX_BODY_BYTES = 12 * 1024 * 1024;
const MAX_PHOTOS = 6;
const RATE_LIMIT_PER_MINUTE = 20;
const ALLOWED_ORIGINS = new Set([
  'http://127.0.0.1:43127',
  'http://localhost:43127',
]);

const hasKey = Boolean(process.env.ANTHROPIC_API_KEY);
const client = hasKey ? new Anthropic() : null;

const Output = z.object({
  titulo: z.string().describe('Título del aviso para el sitio, claro y atractivo, hasta 80 caracteres'),
  descripcion: z.string().describe('Descripción para la ficha del sitio, 2 a 4 párrafos cortos'),
  caracteristicas: z.array(z.string()).describe('Entre 4 y 8 características breves, sin repetir la descripción'),
  instagram: z.string().describe('Texto para una publicación de Instagram, con emojis moderados y 5 a 8 hashtags al final'),
  facebook: z.string().describe('Texto para una publicación de Facebook, un poco más largo que el de Instagram'),
  mercadolibre_titulo: z.string().describe('Título para Mercado Libre, máximo 60 caracteres'),
  mercadolibre_descripcion: z.string().describe('Descripción para Mercado Libre, sin datos de contacto'),
  whatsapp: z.string().describe('Mensaje corto para enviar por WhatsApp a quien pregunta por la propiedad'),
  sugerencias: z.array(z.string()).describe('Qué datos o fotos faltan o se pueden mejorar para que el aviso funcione mejor'),
});

const SYSTEM = `Sos redactor de avisos inmobiliarios de una inmobiliaria de Coronel Suárez, Argentina.
Escribís en español rioplatense, claro y profesional, sin exageraciones.

Reglas:
- Usá solo los datos que te dan y lo que se ve en las fotos. No inventes metros, ambientes, antigüedad, orientación, servicios ni estado.
- Si algo no está en los datos ni se ve en las fotos, no lo afirmes. Si es importante, sugerí cargarlo en «sugerencias».
- No incluyas teléfonos, mails ni direcciones exactas en el texto de Mercado Libre.
- No uses lenguaje discriminatorio ni promesas de rentabilidad o valorización.
- Mencioná el precio solo si viene en los datos; si dice «Consultar», invitá a consultar.
- Los textos de redes terminan invitando a consultar por WhatsApp o por mensaje directo.
- El título de Mercado Libre no puede pasar de 60 caracteres.`;

const buckets = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const recent = (buckets.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  buckets.set(ip, recent);
  return recent.length > RATE_LIMIT_PER_MINUTE;
}

function send(res, status, body, origin) {
  const headers = { 'Content-Type': 'application/json; charset=utf-8' };
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Vary'] = 'Origin';
  }
  res.writeHead(status, headers);
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error('Cuerpo demasiado grande'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function describeProperty(p) {
  const lines = [
    `Operación: ${p.operation ?? 'sin dato'}`,
    `Tipo: ${p.type ?? 'sin dato'}`,
    `Ubicación: ${p.location ?? 'sin dato'}`,
    `Zona: ${p.zone ?? 'sin dato'}`,
    `Precio: ${p.priceLabel || 'sin dato'}`,
    `Superficie: ${p.areaLabel || 'sin dato'}`,
    `Dormitorios: ${p.beds ?? 'sin dato'}`,
    `Baños: ${p.baths ?? 'sin dato'}`,
    `Destacado: ${p.highlight || 'sin dato'}`,
    `Características cargadas: ${(p.amenities ?? []).join(', ') || 'ninguna'}`,
  ];
  if (p.description) lines.push(`Descripción actual (para mejorar): ${p.description}`);
  return lines.join('\n');
}

function parsePhoto(photo) {
  const match = /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/.exec(photo?.dataUrl ?? '');
  if (!match) return null;
  return {
    block: { type: 'image', source: { type: 'base64', media_type: match[1], data: match[2] } },
    caption: String(photo.caption ?? '').slice(0, 120),
  };
}

async function handleListingCopy(req, res, origin) {
  if (!client) {
    return send(res, 503, { error: 'sin_clave', message: 'El servidor no tiene ANTHROPIC_API_KEY.' }, origin);
  }
  let payload;
  try {
    payload = JSON.parse(await readBody(req));
  } catch (error) {
    return send(res, error.status ?? 400, { error: 'cuerpo_invalido' }, origin);
  }
  const property = payload?.property ?? {};
  const tone = ['profesional', 'cercano', 'premium'].includes(payload?.tone) ? payload.tone : 'profesional';
  const photos = (Array.isArray(payload?.photos) ? payload.photos : [])
    .slice(0, MAX_PHOTOS)
    .map(parsePhoto)
    .filter(Boolean);

  const content = [];
  photos.forEach((photo, index) => {
    content.push({ type: 'text', text: `Foto ${index + 1}${photo.caption ? ` (${photo.caption})` : ''}:` });
    content.push(photo.block);
  });
  content.push({
    type: 'text',
    text: `Datos de la propiedad:\n${describeProperty(property)}\n\nTono: ${tone}.\nGenerá el paquete de textos.`,
  });

  try {
    const response = await client.messages.parse({
      model: MODEL,
      max_tokens: 8000,
      system: SYSTEM,
      messages: [{ role: 'user', content }],
      output_config: { effort: 'low', format: zodOutputFormat(Output) },
    });
    if (response.stop_reason === 'refusal') {
      return send(res, 422, { error: 'rechazado', message: 'El modelo no pudo redactar este aviso.' }, origin);
    }
    if (!response.parsed_output) {
      return send(res, 502, { error: 'sin_resultado' }, origin);
    }
    return send(
      res,
      200,
      { ...response.parsed_output, model: MODEL, usage: response.usage, photosUsed: photos.length },
      origin
    );
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return send(res, 429, { error: 'limite', message: 'Demasiadas consultas, probá en un minuto.' }, origin);
    }
    if (error instanceof Anthropic.AuthenticationError) {
      return send(res, 503, { error: 'clave_invalida' }, origin);
    }
    if (error instanceof Anthropic.APIError) {
      console.error('Error de la API:', error.status, error.message);
      return send(res, 502, { error: 'api', status: error.status }, origin);
    }
    console.error(error);
    return send(res, 500, { error: 'interno' }, origin);
  }
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  const url = new URL(req.url ?? '/', 'http://127.0.0.1');

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': origin && ALLOWED_ORIGINS.has(origin) ? origin : '',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }
  if (req.method === 'GET' && url.pathname === '/api/ai/status') {
    return send(res, 200, { ok: true, configured: hasKey, model: MODEL }, origin);
  }
  if (req.method === 'POST' && url.pathname === '/api/ai/listing-copy') {
    if (rateLimited(req.socket.remoteAddress ?? 'local')) {
      return send(res, 429, { error: 'limite' }, origin);
    }
    return handleListingCopy(req, res, origin);
  }
  return send(res, 404, { error: 'no_encontrado' }, origin);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Redactor de avisos en http://127.0.0.1:${PORT} (modelo ${MODEL}, ${hasKey ? 'con clave' : 'SIN clave'})`);
});
