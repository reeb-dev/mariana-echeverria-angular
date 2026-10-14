/**
 * Páginas por zona (`/zona/:slug`). Son datos puros, sin dependencias, para que el script que arma el sitio
 * (`tools/postbuild.mjs`) los pueda leer y generar el título y la descripción de cada una.
 */
export type ZonePage = {
  slug: string;
  /** Id de zona de las propiedades (ver `zone` en `properties.ts`). */
  zoneId: string;
  name: string;
  /** Título para Google (aparece en la pestaña y en los resultados). */
  seoTitle: string;
  /** Descripción corta para Google y para compartir. */
  description: string;
  intro: string;
  /** Qué se hace en la zona. */
  services: string[];
};

export const ZONE_PAGES: ZonePage[] = [
  {
    slug: 'coronel-suarez',
    zoneId: 'coronel-suarez',
    name: 'Coronel Suárez',
    seoTitle: 'Inmobiliaria en Coronel Suárez: venta, alquiler y tasaciones',
    description:
      'Casas, departamentos, comercios, lotes y campos en Coronel Suárez. Venta, alquiler, arrendamientos y tasaciones en el día.',
    intro:
      'Casas, departamentos, comercios y campos en Coronel Suárez y el sudoeste bonaerense. Trabajamos desde la oficina de Las Heras 1465 con avisos claros, difusión en redes y acompañamiento hasta la escritura.',
    services: [
      'Venta y alquiler de casas, departamentos y locales',
      'Venta y arrendamiento de campos y lotes',
      'Tasaciones en el día para venta, sucesión, garantía o refinanciación',
      'Asesoramiento legal en cada operación',
    ],
  },
  {
    slug: 'sierra-de-la-ventana',
    zoneId: 'sierra-ventana',
    name: 'Sierra de la Ventana',
    seoTitle: 'Lotes y propiedades en Sierra de la Ventana',
    description: 'Lotes y propiedades en Sierra de la Ventana, con tasación y asesoramiento legal.',
    intro:
      'Lotes y propiedades en Sierra de la Ventana. Te acompañamos en la compra o la venta, desde la tasación hasta la documentación.',
    services: ['Venta de lotes y terrenos', 'Tasaciones', 'Asesoramiento legal y escrituración'],
  },
  {
    slug: 'zona-norte',
    zoneId: 'zona-norte',
    name: 'Zona Norte y CABA',
    seoTitle: 'Inmobiliaria en Zona Norte: Tigre, Nordelta y CABA',
    description: 'Propiedades en Tigre, Nordelta y Capital Federal desde nuestra sucursal Norte.',
    intro:
      'Propiedades en Tigre, Nordelta y Capital desde la Sucursal Norte, en Av. de Todos los Santos 5600 (Tigre). Casas y departamentos con atención personalizada.',
    services: ['Venta de casas y departamentos', 'Tasaciones', 'Asesoramiento legal en cada operación'],
  },
  {
    slug: 'costa-argentina',
    zoneId: 'costa-argentina',
    name: 'Costa Argentina',
    seoTitle: 'Propiedades en la Costa Argentina: temporada e inversión',
    description: 'Inmuebles de temporada e inversión en la Costa Argentina.',
    intro: 'Inmuebles de temporada e inversión en la costa. Operaciones puntuales con acompañamiento profesional.',
    services: ['Venta de inmuebles de temporada', 'Inversión', 'Tasaciones y asesoramiento legal'],
  },
];
