// Después de compilar: arma una página por ruta conocida y el sitemap.
//
//   node tools/postbuild.mjs <carpeta-del-build> [url-del-sitio]
//
// Qué resuelve: en GitHub Pages las direcciones que no son archivos responden 404 (se sirve la aplicación desde la
// página de error). Acá se escribe un `index.html` por ruta, así responden 200 y, además, cada una sale con su propio
// título, descripción, imagen para compartir y datos estructurados en el HTML, sin esperar a que corra JavaScript.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outDir = path.resolve(process.argv[2] ?? 'dist/tmp-angular/browser');
const siteUrl = (process.argv[3] ?? process.env.SITE_URL ?? 'https://reeb-dev.github.io/mariana-echeverria-angular').replace(/\/$/, '');

const indexPath = path.join(outDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error(`No existe ${indexPath}. Compilá primero.`);
  process.exit(1);
}

/** Carga un archivo .ts de datos (sin dependencias) transpilándolo en memoria. */
function loadTs(relative) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  const url = 'data:text/javascript;base64,' + Buffer.from(outputText).toString('base64');
  return import(url);
}

const props = await loadTs('src/app/data/properties.ts');
const guides = await loadTs('src/app/data/guides.ts');
const zones = await loadTs('src/app/data/zone-pages.ts');

const esc = (text) =>
  String(text).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const SITE = 'Mariana Echeverría Bienes Raíces';
const baseHtml = fs.readFileSync(indexPath, 'utf8');

/** Precio numérico a partir de «USD 54.000» o «$ 1.200.000 / mes»; null si dice «Consultar». */
function parsePrice(label) {
  const digits = String(label).replace(/[^\d.]/g, '').replace(/\./g, '');
  if (!digits) return null;
  return { price: Number(digits), currency: /usd|u\$s/i.test(label) ? 'USD' : 'ARS' };
}

/** Escribe el HTML de una ruta con su título, descripción, imagen y datos estructurados. */
function writePage(route, { title, description, image, jsonLd }) {
  const url = `${siteUrl}${route === '/' ? '/' : route}`;
  const head = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="es_AR" />`,
    `<meta property="og:site_name" content="${esc(SITE)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    image ? `<meta property="og:image" content="${esc(image)}" />` : '',
    `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />`,
    jsonLd ? `<script type="application/ld+json" id="mer-jsonld">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>` : '',
  ]
    .filter(Boolean)
    .join('\n    ');

  let html = baseHtml
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta\s+name="description"[\s\S]*?\/>/, '')
    .replace('</head>', `    ${head}\n  </head>`);

  const target = route === '/' ? indexPath : path.join(outDir, route.replace(/^\//, ''), 'index.html');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, html);
}

const pages = [];
const add = (route, meta, changefreq = 'monthly', priority = '0.6') => {
  writePage(route, meta);
  pages.push({ route, changefreq, priority });
};

add(
  '/',
  {
    title: `${SITE} | Inmobiliaria en Coronel Suárez y Zona Norte`,
    description:
      'Venta, alquiler, arrendamientos y tasaciones en Coronel Suárez, Sierra de la Ventana y Zona Norte. Corredora y abogada con 25 años de trayectoria.',
    image: `${siteUrl}/hero/hero-1280.webp`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'RealEstateAgent',
      name: SITE,
      telephone: props.CONTACT.phoneDisplay,
      email: props.CONTACT.email,
      url: `${siteUrl}/`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Las Heras 1465',
        addressLocality: 'Coronel Suárez',
        addressCountry: 'AR',
      },
    },
  },
  'weekly',
  '1.0'
);

add('/tasacion', {
  title: `Pedí tu tasación en el día | ${SITE}`,
  description:
    'Tasación de casas, departamentos, lotes, locales y campos en Coronel Suárez y Zona Norte. Para venta, sucesión, garantía o refinanciación.',
});
add('/calculadoras', {
  title: `Calculadoras de gastos de compra y alquiler | ${SITE}`,
  description: 'Estimá los gastos de una compra y lo que necesitás para entrar a un alquiler, con valores que podés ajustar.',
});
add('/privacidad', {
  title: `Política de privacidad | ${SITE}`,
  description: 'Qué datos recolectamos, para qué los usamos y cómo ejercer tus derechos.',
});
add('/guias', {
  title: `Guías para comprar, vender y heredar una propiedad | ${SITE}`,
  description: 'Qué papeles hacen falta para vender, cómo es una sucesión con una propiedad y qué gastos tiene una operación.',
}, 'monthly', '0.7');

for (const g of guides.GUIDES) {
  add(`/guias/${g.slug}`, {
    title: `${g.title} | ${SITE}`,
    description: g.description,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: g.title,
      description: g.description,
      author: { '@type': 'Person', name: 'Mariana Laura Echeverría' },
    },
  }, 'monthly', '0.7');
}

for (const z of zones.ZONE_PAGES) {
  add(`/zona/${z.slug}`, { title: `${z.seoTitle} | ${SITE}`, description: z.description }, 'weekly', '0.8');
}

for (const p of props.PROPERTIES) {
  const first = p.photos[0];
  const dir = first.src.replace(/\/[^/]+$/, '');
  const price = parsePrice(p.priceLabel);
  add(`/propiedades/${p.slug}`, {
    title: `${p.title} | ${SITE}`,
    description: p.description.slice(0, 160),
    image: `${siteUrl}${dir}/cover-card.webp`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'RealEstateListing',
      name: p.title,
      description: p.description,
      url: `${siteUrl}/propiedades/${p.slug}`,
      ...(price ? { offers: { '@type': 'Offer', price: price.price, priceCurrency: price.currency } } : {}),
    },
  }, 'weekly', '0.9');
}

// sitemap.xml
const today = new Date().toISOString().slice(0, 10);
const sitemap =
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  pages
    .map(
      ({ route, changefreq, priority }) =>
        `  <url><loc>${esc(siteUrl + (route === '/' ? '/' : route))}</loc><lastmod>${today}</lastmod>` +
        `<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`
    )
    .join('\n') +
  '\n</urlset>\n';
fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap);

// robots.txt con el mapa del sitio
const robotsPath = path.join(outDir, 'robots.txt');
let robots = fs.existsSync(robotsPath) ? fs.readFileSync(robotsPath, 'utf8') : 'User-agent: *\nAllow: /\n';
robots = robots.replace(/^Sitemap:.*$/gm, '').trimEnd() + `\nSitemap: ${siteUrl}/sitemap.xml\n`;
fs.writeFileSync(robotsPath, robots);

// 404.html: la aplicación, para las rutas que no se conocen de antemano (por ejemplo, propiedades nuevas del panel)
fs.copyFileSync(indexPath, path.join(outDir, '404.html'));

console.log(`Postbuild: ${pages.length} páginas, sitemap.xml y robots.txt en ${outDir}`);
void createRequire;
void pathToFileURL;
