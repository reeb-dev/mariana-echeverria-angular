export type PropertyOperation = 'venta' | 'alquiler';
/** Slug de zona; nuevas zonas en PROPERTIES aparecen solas en el filtro. */
export type PropertyZone = string;
export type PropertyType =
  | 'casa'
  | 'departamento'
  | 'campo'
  | 'lote'
  | 'local';

export type PropertyStatus = 'publicada' | 'pausada' | 'vendida' | 'alquilada';

export const STATUS_LABELS: Record<PropertyStatus, string> = {
  publicada: 'Publicada',
  pausada: 'Pausada',
  vendida: 'Vendida',
  alquilada: 'Alquilada',
};

export type PropertyPhoto = {
  src: string;
  alt: string;
  caption: string;
  /** La marca de agua ya está dentro de la imagen (se agrega al subirla desde el panel). */
  watermarked?: boolean;
};

export type Property = {
  id: string;
  slug: string;
  title: string;
  location: string;
  zone: PropertyZone;
  operation: PropertyOperation;
  type: PropertyType;
  priceLabel: string;
  beds?: number;
  baths?: number;
  areaLabel: string;
  highlight?: string;
  description: string;
  amenities: string[];
  photos: PropertyPhoto[];
  /** Si falta, se considera `publicada`. Solo las publicadas salen en la home. */
  status?: PropertyStatus;
  /** Aparece en la sección «Destacadas» de la home. */
  featured?: boolean;
  /** Orden dentro de las destacadas (menor = primero). */
  featuredOrder?: number;
  /** Usuario del panel responsable de la propiedad (el agente solo edita las suyas). */
  agentId?: string;
  /** Fechas ISO de alta y última edición (las propiedades de ejemplo no las tienen). */
  createdAt?: string;
  updatedAt?: string;

  /** Sucursal que la atiende; si falta se deduce de la zona. */
  branch?: PropertyBranch;
  /** Ubicación en el mapa. Con `mapApprox` se muestra una zona y no el punto exacto. */
  lat?: number;
  lng?: number;
  mapApprox?: boolean;
  /** Antigüedad en años (0 = a estrenar). */
  ageYears?: number;
  /** Cantidad de cocheras. */
  garages?: number;
  /** Solo campos y lotes: */
  hectares?: number;
  aptitude?: string;
  improvements?: string;
  routeDistanceKm?: number;
  /** Datos internos del propietario: nunca se muestran en el sitio. */
  ownerName?: string;
  ownerPhone?: string;
};

export type PropertyBranch = 'coronel-suarez' | 'zona-norte';

export const BRANCH_LABELS: Record<PropertyBranch, string> = {
  'coronel-suarez': 'Coronel Suárez',
  'zona-norte': 'Zona Norte',
};

/** Sucursal de la propiedad: la cargada, o la que corresponde a su zona. */
export function branchOf(p: Property): PropertyBranch {
  if (p.branch) return p.branch;
  return /norte|tigre|nordelta|caba/i.test(p.zone) ? 'zona-norte' : 'coronel-suarez';
}

/** Etiquetas legibles; si falta, se deriva del slug. */
export const ZONE_LABELS: Record<string, string> = {
  'coronel-suarez': 'Coronel Suárez',
  'zona-norte': 'Zona Norte',
  'sierra-ventana': 'Sierra de la Ventana',
  'costa-argentina': 'Costa Argentina',
};

export function labelForZone(zone: PropertyZone): string {
  const known = ZONE_LABELS[zone];
  if (known) return known;
  return zone
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/** Opciones de filtro derivadas del inventario (únicas, A–Z). */
export function zoneFilterOptionsFrom(
  properties: readonly Property[]
): { id: PropertyZone; label: string }[] {
  const unique = [...new Set(properties.map((p) => p.zone).filter(Boolean))];
  return unique
    .map((id) => ({ id, label: labelForZone(id) }))
    .sort((a, b) => a.label.localeCompare(b.label, 'es'));
}

export const CONTACT = {
  brand: 'Mariana Echeverría',
  tagline: 'Bienes Raíces',
  phoneDisplay: '11 6591 1565',
  phoneSecondary: '02926 460944',
  whatsappUrl: 'https://wa.me/5491165911565',
  email: 'marianalecheverria@gmail.com',
  instagram: 'coronelsuarezbienesraices',
  instagramUrl: 'https://www.instagram.com/coronelsuarezbienesraices/',
  matricula: 'Mat. CMCBB 2227',
  /** Enlace a la ficha de Google con reseñas (dejar vacío si todavía no hay). */
  googleReviewsUrl: '',
  years: '25',
  offices: [
    {
      name: 'Coronel Suárez',
      address: 'Las Heras 1465, Coronel Suárez',
      detail: 'Casas, locales, lotes y campos del sudoeste bonaerense',
    },
    {
      name: 'Sucursal Norte',
      address: 'Av. de Todos los Santos 5600, Tigre',
      detail: 'Zona Norte, Nordelta, Tigre y CABA',
    },
  ],
} as const;

/** Servicios alineados a lo que comunica en Instagram / perfil profesional */
export const SERVICES = [
  {
    title: 'Venta',
    description:
      'Casas, departamentos, locales y campos. Publicación clara, difusión en redes y acompañamiento hasta la escritura.',
  },
  {
    title: 'Alquiler y arrendamientos',
    description:
      'Locaciones urbanas y rurales: departamentos, locales y campos para arrendar con contratos ordenados.',
  },
  {
    title: 'Tasaciones en el día',
    description:
      'Valuación a precio de mercado cuando necesitás decidir rápido: venta, sucesión, garantía o refinanciación.',
  },
  {
    title: 'Home staging y desarrollos',
    description:
      'Puesta en valor antes de publicar, loteos y desarrollos para que el aviso se vea como en Instagram: nítido y vendible.',
  },
  {
    title: 'Derecho inmobiliario',
    description:
      'Abogada con foco en negociación: sucesiones, divorcios, desalojos y operaciones con respaldo legal.',
  },
] as const;

export const ZONES = [
  { name: 'Coronel Suárez', detail: 'Casas, deptos, comercios y campos' },
  { name: 'Zona Norte y CABA', detail: 'Tigre, Nordelta y Capital' },
  { name: 'Costa Argentina', detail: 'Inmuebles de temporada e inversión' },
  { name: 'Patagonia', detail: 'Operaciones puntuales fuera del eje' },
] as const;

export const PROCESS = [
  {
    step: '01',
    title: 'Consulta',
    description:
      'Por WhatsApp o Instagram contame qué necesitás: vender, alquilar, tasar o resolver un tema jurídico.',
  },
  {
    step: '02',
    title: 'Tasación',
    description:
      'Relevamos el inmueble y el mercado. En muchos casos la valuación sale el mismo día.',
  },
  {
    step: '03',
    title: 'Publicación',
    description:
      'Armamos fotos, texto y difusión — el mismo criterio que ves en @coronelsuarezbienesraices.',
  },
  {
    step: '04',
    title: 'Cierre',
    description:
      'Negociación, reserva y escritura o contrato, con mirada legal de punta a punta.',
  },
] as const;

export const CREDENTIALS = [
  'Corredora, tasadora y martillera pública — Mat. 2227 CBB',
  'Abogada · corredora inmobiliaria · tasadora',
  'Ventas · alquileres · tasaciones (bio de @coronelsuarezbienesraices)',
  '25 años de servicios profesionales personalizados',
  'Oficinas en Coronel Suárez y Sucursal Norte (Tigre)',
] as const;

/** Destacados del perfil @coronelsuarezbienesraices (bio + highlights) */
export const INSTAGRAM_HIGHLIGHTS = [
  {
    title: 'Ventas',
    detail: 'Casas y departamentos en Coronel Suárez, Tigre y alrededores.',
  },
  {
    title: 'Alquileres',
    detail: 'Locaciones urbanas y rurales con contratos claros.',
  },
  {
    title: 'Tasaciones',
    detail: 'Valuaciones para decidir rápido: venta, sucesión o garantía.',
  },
  {
    title: 'Nuevos ingresos',
    detail: 'Avisos frescos del feed: CS, Zona Norte y oportunidades nuevas.',
  },
] as const;

/**
 * Publicaciones para la grilla de Instagram del inicio. Se cargan a mano (la web no se conecta a Instagram): la URL
 * de cada publicación y una imagen propia. Si la lista está vacía, la grilla no se muestra.
 */
export type InstagramPost = { url: string; image: string; alt: string };
export const INSTAGRAM_POSTS: InstagramPost[] = [];

export type Testimonial = {
  quote: string;
  name: string;
  place: string;
  /** Qué operación fue («Venta de una casa en Mitre»). */
  operation?: string;
  /** Foto de la persona (con su permiso). */
  photo?: string;
  /** Enlace a la reseña original, si existe. */
  url?: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Publicó la casa con fotos y un texto claro, como en su Instagram. En pocas semanas cerramos la venta.',
    name: 'Familia G.',
    place: 'Coronel Suárez',
  },
  {
    quote:
      'Necesitábamos tasación urgente por una sucesión. La tuvo lista el mismo día y nos orientó en los papeles.',
    name: 'Héctor M.',
    place: 'Coronel Suárez',
  },
  {
    quote:
      'Alquilamos un local con contrato prolijo y seguimiento. Se nota que es corredora y abogada.',
    name: 'Lucía P.',
    place: 'Centro',
  },
];

export type Faq = { q: string; a: string; link?: { label: string; path: string } };

export const FAQS: Faq[] = [
  {
    q: '¿Hacen tasaciones en el día?',
    a: 'Sí. Según el tipo de inmueble y la documentación, en muchos casos entregamos valuación de mercado el mismo día — es uno de los servicios que más pedís por Instagram y WhatsApp.',
  },
  {
    q: '¿Publican en Instagram todas las propiedades?',
    a: 'La mayoría de los avisos activos se difunden en @coronelsuarezbienesraices: venta, alquiler, lotes y novedades de tasación. Acá en la web tenés la ficha con galería completa.',
  },
  {
    q: '¿Trabajan Coronel Suárez y Zona Norte?',
    a: 'Sí. Oficina en Las Heras 1465 (Coronel Suárez) y Sucursal Norte en Av. de Todos los Santos 5600 (Tigre), con operaciones en Nordelta y alrededores.',
  },
  {
    q: '¿Qué es el home staging?',
    a: 'Es la puesta en valor antes de publicar: orden, luz y encuadre para que el aviso se vea atractivo en fotos — clave cuando el primer contacto es por Instagram.',
  },
  {
    q: '¿Cuánto cuesta comprar o vender una propiedad?',
    a: 'Además del precio hay honorarios, impuestos y gastos de escribanía. Los montos dependen de cada operación: en la calculadora podés hacer una estimación y en la guía tenés el detalle de qué se paga en cada caso.',
    link: { label: 'Ver la guía de gastos', path: '/guias/gastos-de-comprar-o-vender' },
  },
  {
    q: '¿Qué papeles necesito para vender?',
    a: 'Título de propiedad, DNI y estado civil de los titulares, datos catastrales, y comprobantes de impuestos y servicios al día. Según el caso pueden pedirse más documentos.',
    link: { label: 'Ver la lista completa', path: '/guias/papeles-para-vender-una-propiedad' },
  },
];

/** Inventario demo (CS urbano, lotes, alquileres, Zona Norte). Galerías: fotos de avisos públicos (Pogost, Ferrari, Galeazzi, BG, Argenprop, etc.) en public/properties — ver SOURCES.md. No Instagram. */
export const PROPERTIES: Property[] = [
  {
    id: '1',
    featured: true,
    featuredOrder: 1,
    slug: 'casa-mitre-coronel-suarez',
    lat: -37.4581,
    lng: -61.9362,
    mapApprox: true,
    title: 'Casa en venta – Mitre 2000',
    location: 'Coronel Suárez',
    zone: 'coronel-suarez',
    operation: 'venta',
    type: 'casa',
    priceLabel: 'USD 54.000',
    beds: 3,
    baths: 2,
    areaLabel: '180 m²',
    highlight: 'Casa familiar',
    description:
      'Casa en Mitre 2000, Coronel Suárez. Living-comedor, cocina, dormitorios y patio. Precio visible, fotos del circuito inmobiliario de Coronel Suárez y consulta directa por WhatsApp.',
    amenities: ['Patio', 'Garage', 'Cocina separada', 'Barrio consolidado', 'Cerca del centro'],
        photos: [
      {
        src: '/properties/casa-mitre/01.webp',
        watermarked: true,
        alt: 'Fachada',
        caption: 'Fachada',
      },
      {
        src: '/properties/casa-mitre/02.webp',
        watermarked: true,
        alt: 'Living',
        caption: 'Living',
      },
      {
        src: '/properties/casa-mitre/03.webp',
        watermarked: true,
        alt: 'Cocina',
        caption: 'Cocina',
      },
      {
        src: '/properties/casa-mitre/04.webp',
        watermarked: true,
        alt: 'Dormitorio',
        caption: 'Dormitorio',
      },
      {
        src: '/properties/casa-mitre/05.webp',
        watermarked: true,
        alt: 'Patio',
        caption: 'Patio',
      },
      {
        src: '/properties/casa-mitre/06.webp',
        watermarked: true,
        alt: 'Garage',
        caption: 'Garage',
      },
    ],
  },
  {
    id: '2',
    agentId: 'u-agente',
    slug: 'departamento-rivas-alquiler',
    lat: -37.4548,
    lng: -61.9311,
    mapApprox: true,
    title: 'Excelente departamento – Rivas 200',
    location: 'Coronel Suárez',
    zone: 'coronel-suarez',
    operation: 'alquiler',
    type: 'departamento',
    priceLabel: '$ 1.200.000 / mes',
    beds: 2,
    baths: 1,
    areaLabel: '65 m²',
    highlight: 'Alquiler activo',
    description:
      'Departamento en Rivas 200, listo para habitar. Dos dormitorios, living y cocina. Ubicación, precio mensual y consulta rápida por WhatsApp.',
    amenities: ['Luminoso', 'Cocina equipada', 'Cerca de servicios', 'Segundo piso'],
        photos: [
      {
        src: '/properties/depto-rivas/01.webp',
        watermarked: true,
        alt: 'Living',
        caption: 'Living',
      },
      {
        src: '/properties/depto-rivas/02.webp',
        watermarked: true,
        alt: 'Ambiente',
        caption: 'Ambiente',
      },
      {
        src: '/properties/depto-rivas/03.webp',
        watermarked: true,
        alt: 'Cocina',
        caption: 'Cocina',
      },
      {
        src: '/properties/depto-rivas/04.webp',
        watermarked: true,
        alt: 'Dormitorio',
        caption: 'Dormitorio',
      },
      {
        src: '/properties/depto-rivas/05.webp',
        watermarked: true,
        alt: 'Baño',
        caption: 'Baño',
      },
      {
        src: '/properties/depto-rivas/06.webp',
        watermarked: true,
        alt: 'Estar',
        caption: 'Estar',
      },
    ],
  },
  {
    id: '3',
    featured: true,
    featuredOrder: 3,
    slug: 'lote-sierra-de-la-ventana',
    lat: -38.1356,
    lng: -61.7922,
    mapApprox: true,
    title: 'Terreno/lote – Juan Bautista Gil',
    location: 'Sierra de la Ventana',
    zone: 'sierra-ventana',
    operation: 'venta',
    type: 'lote',
    priceLabel: 'USD 21.000',
    areaLabel: 'Consultar medidas',
    highlight: 'Para proyecto',
    description:
      'Lote en Juan Bautista Gil, Sierra de la Ventana. Ideal vivienda de fin de semana o inversión. Ubicación, precio y contacto inmediato por WhatsApp.',
    amenities: ['Entorno serrano', 'Para construir', 'Inversión', 'Escritura'],
        photos: [
      {
        src: '/properties/lote-sierra/01.webp',
        watermarked: true,
        alt: 'Vista del lote',
        caption: 'Vista del lote',
      },
      {
        src: '/properties/lote-sierra/02.webp',
        watermarked: true,
        alt: 'Entorno serrano',
        caption: 'Entorno serrano',
      },
      {
        src: '/properties/lote-sierra/03.webp',
        watermarked: true,
        alt: 'Horizonte',
        caption: 'Horizonte',
      },
      {
        src: '/properties/lote-sierra/04.webp',
        watermarked: true,
        alt: 'Vegetación',
        caption: 'Vegetación',
      },
      {
        src: '/properties/lote-sierra/05.webp',
        watermarked: true,
        alt: 'Relieve',
        caption: 'Relieve',
      },
      {
        src: '/properties/lote-sierra/06.webp',
        watermarked: true,
        alt: 'Paisaje',
        caption: 'Paisaje',
      },
    ],
  },
  {
    id: '4',
    agentId: 'u-agente',
    slug: 'local-belgrano-alquiler',
    lat: -37.4565,
    lng: -61.9295,
    mapApprox: true,
    title: 'Local en alquiler – Belgrano 1200',
    location: 'Coronel Suárez',
    zone: 'coronel-suarez',
    operation: 'alquiler',
    type: 'local',
    priceLabel: '$ 1.200.000 / mes',
    areaLabel: 'Consultar',
    highlight: 'Vidriera a la calle',
    description:
      'Local comercial en Belgrano 1200 con buena exposición. Apto comercio o servicio profesional. Ubicación, precio y consulta por WhatsApp.',
    amenities: ['Vidriera', 'Zona comercial', 'Baño', 'Alta circulación'],
        photos: [
      {
        src: '/properties/local-belgrano/01.webp',
        watermarked: true,
        alt: 'Frente',
        caption: 'Frente',
      },
      {
        src: '/properties/local-belgrano/02.webp',
        watermarked: true,
        alt: 'Vidriera',
        caption: 'Vidriera',
      },
      {
        src: '/properties/local-belgrano/03.webp',
        watermarked: true,
        alt: 'Interior',
        caption: 'Interior',
      },
      {
        src: '/properties/local-belgrano/04.webp',
        watermarked: true,
        alt: 'Salón',
        caption: 'Salón',
      },
      {
        src: '/properties/local-belgrano/05.webp',
        watermarked: true,
        alt: 'Espacio comercial',
        caption: 'Espacio comercial',
      },
      {
        src: '/properties/local-belgrano/06.webp',
        watermarked: true,
        alt: 'Detalle',
        caption: 'Detalle',
      },
    ],
  },
  {
    id: '5',
    featured: true,
    featuredOrder: 2,
    slug: 'chalet-nordelta',
    lat: -34.4036,
    lng: -58.6475,
    mapApprox: true,
    title: 'Chalet en Nordelta',
    location: 'Av. de los Lagos, Nordelta, Tigre',
    zone: 'zona-norte',
    operation: 'venta',
    type: 'casa',
    priceLabel: 'USD 850.000',
    beds: 4,
    baths: 4,
    areaLabel: '320 m²',
    highlight: 'Sucursal Norte',
    description:
      'Chalet en Nordelta con jardín y amenities del barrio. Representa la línea Zona Norte que también difundimos desde la Sucursal Tigre: producto premium, fotos cuidadas y atención personalizada.',
    amenities: ['Pileta', 'Jardín', 'Cochera', 'Suite', 'Barrio cerrado', 'Seguridad'],
        photos: [
      {
        src: '/properties/chalet-nordelta/01.webp',
        watermarked: true,
        alt: 'Fachada',
        caption: 'Fachada',
      },
      {
        src: '/properties/chalet-nordelta/02.webp',
        watermarked: true,
        alt: 'Exterior',
        caption: 'Exterior',
      },
      {
        src: '/properties/chalet-nordelta/03.webp',
        watermarked: true,
        alt: 'Living',
        caption: 'Living',
      },
      {
        src: '/properties/chalet-nordelta/04.webp',
        watermarked: true,
        alt: 'Suite',
        caption: 'Suite',
      },
      {
        src: '/properties/chalet-nordelta/05.webp',
        watermarked: true,
        alt: 'Jardín',
        caption: 'Jardín',
      },
      {
        src: '/properties/chalet-nordelta/06.webp',
        watermarked: true,
        alt: 'Pileta',
        caption: 'Pileta',
      },
    ],
  },
  {
    id: '6',
    slug: 'depto-paseo-victorica-tigre',
    lat: -34.4236,
    lng: -58.5788,
    mapApprox: true,
    title: 'Depto en venta – Paseo Victorica',
    location: 'Paseo Victorica, Tigre',
    zone: 'zona-norte',
    operation: 'venta',
    type: 'departamento',
    priceLabel: 'Consultar',
    beds: 2,
    baths: 2,
    areaLabel: '75 m²',
    highlight: 'Frente al río',
    description:
      'Departamento en Paseo Victorica, Tigre. Ubicación sobre el río, ideal vivienda o inversión. Representa la línea Zona Norte: ubicación sobre el río, ficha con fotos de avisos públicos y consulta por WhatsApp.',
    amenities: ['Vista abierta', 'Balcón', 'Amenities', 'Cerca del centro de Tigre'],
        photos: [
      {
        src: '/properties/depto-victorica/01.webp',
        watermarked: true,
        alt: 'Living',
        caption: 'Living',
      },
      {
        src: '/properties/depto-victorica/02.webp',
        watermarked: true,
        alt: 'Dormitorio',
        caption: 'Dormitorio',
      },
      {
        src: '/properties/depto-victorica/03.webp',
        watermarked: true,
        alt: 'Cocina',
        caption: 'Cocina',
      },
      {
        src: '/properties/depto-victorica/04.webp',
        watermarked: true,
        alt: 'Balcón / vista',
        caption: 'Balcón / vista',
      },
      {
        src: '/properties/depto-victorica/05.webp',
        watermarked: true,
        alt: 'Baño',
        caption: 'Baño',
      },
      {
        src: '/properties/depto-victorica/06.webp',
        watermarked: true,
        alt: 'Ambiente',
        caption: 'Ambiente',
      },
    ],
  },
  {
    id: '7',
    slug: 'lotes-san-jose-berutti',
    title: 'Lotes en San José',
    location: 'Berutti / Pueblo San José',
    zone: 'coronel-suarez',
    operation: 'venta',
    type: 'lote',
    priceLabel: 'USD 13.650',
    areaLabel: 'Últimos lotes',
    highlight: 'Desarrollo',
    description:
      'Últimos lotes en desarrollo de San José (Berutti). Precio accesible para quien busca terreno propio. Últimos lotes: ubicación accesible y valor a consultar.',
    amenities: ['Servicios cercanos', 'Financiación a consultar', 'Zona en crecimiento'],
        photos: [
      {
        src: '/properties/lotes-sanjose/01.webp',
        watermarked: true,
        alt: 'Lote',
        caption: 'Lote',
      },
      {
        src: '/properties/lotes-sanjose/02.webp',
        watermarked: true,
        alt: 'Entorno',
        caption: 'Entorno',
      },
      {
        src: '/properties/lotes-sanjose/03.webp',
        watermarked: true,
        alt: 'Acceso',
        caption: 'Acceso',
      },
      {
        src: '/properties/lotes-sanjose/04.webp',
        watermarked: true,
        alt: 'Panorámica',
        caption: 'Panorámica',
      },
      {
        src: '/properties/lotes-sanjose/05.webp',
        watermarked: true,
        alt: 'Referencia',
        caption: 'Referencia',
      },
      {
        src: '/properties/lotes-sanjose/06.webp',
        watermarked: true,
        alt: 'Servicios',
        caption: 'Servicios',
      },
    ],
  },
  {
    id: '8',
    slug: 'campo-arrendamiento-sudoeste',
    title: 'Campo para arrendamiento',
    location: 'Partido de Coronel Suárez',
    zone: 'coronel-suarez',
    operation: 'alquiler',
    type: 'campo',
    priceLabel: 'Consultar',
    areaLabel: 'Según padrón',
    highlight: 'Arrendamiento rural',
    description:
      'Campo disponible para arrendamiento en el partido. Operaciones rurales con la misma seriedad que las urbanas: contrato claro y seguimiento. Consultá disponibilidad y condiciones por WhatsApp.',
    amenities: ['Aptitud mixta', 'Acceso consolidado', 'Contrato de arrendamiento'],
        photos: [
      {
        src: '/properties/campo/01.webp',
        watermarked: true,
        alt: 'Vista general',
        caption: 'Vista general',
      },
      {
        src: '/properties/campo/02.webp',
        watermarked: true,
        alt: 'Horizonte',
        caption: 'Horizonte',
      },
      {
        src: '/properties/campo/03.webp',
        watermarked: true,
        alt: 'Pastura',
        caption: 'Pastura',
      },
      {
        src: '/properties/campo/04.webp',
        watermarked: true,
        alt: 'Cultivo',
        caption: 'Cultivo',
      },
      {
        src: '/properties/campo/05.webp',
        watermarked: true,
        alt: 'Detalle rural',
        caption: 'Detalle rural',
      },
      {
        src: '/properties/campo/06.webp',
        watermarked: true,
        alt: 'Panorámica',
        caption: 'Panorámica',
      },
    ],
  },
];

export function getPropertyBySlug(slug: string) {
  return PROPERTIES.find((p) => p.slug === slug);
}

export function coverPhoto(property: Property) {
  const first = property.photos[0];
  // Fotos cargadas desde el panel (data URL): no tienen `cover-card.jpg` al lado.
  if (/^(data:|blob:|https?:)/i.test(first.src)) {
    return first;
  }
  const dir = first.src.replace(/\/[^/]+$/, '');
  return {
    src: `${dir}/cover-card.webp`,
    alt: first.alt,
    caption: first.caption,
  };
}
