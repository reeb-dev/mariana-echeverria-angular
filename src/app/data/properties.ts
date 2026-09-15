export type PropertyOperation = 'venta' | 'alquiler';
export type PropertyType =
  | 'casa'
  | 'departamento'
  | 'campo'
  | 'lote'
  | 'local';

export type PropertyPhoto = {
  src: string;
  alt: string;
  caption: string;
};

export type Property = {
  id: string;
  slug: string;
  title: string;
  location: string;
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
};

export const CONTACT = {
  brand: 'Mariana Echeverría',
  tagline: 'Bienes Raíces',
  phoneDisplay: '11 6591 1565',
  phoneSecondary: '02926 460944',
  whatsappUrl: 'https://wa.me/5491165911565',
  email: 'marianalecheverria@gmail.com',
  instagram: 'marianaecheverriainmob',
  instagramUrl: 'https://www.instagram.com/marianaecheverriainmob/',
  matricula: 'Mat. 2227 CBB',
  years: '25+',
  offices: [
    {
      name: 'Coronel Suárez',
      address: 'Las Heras 1465, Coronel Suárez',
      detail: 'Urbano y rural · Sudoeste bonaerense',
    },
    {
      name: 'Sucursal Norte',
      address: 'Av. de Todos los Santos 5600, Tigre',
      detail: 'Zona Norte del GBA · Vicente López a Exaltación',
    },
  ],
} as const;

export const SERVICES = [
  {
    title: 'Venta',
    description:
      'Intermediación personalizada en viviendas, comercios y campos, con acompañamiento legal de punta a punta.',
  },
  {
    title: 'Alquiler y arrendamientos',
    description:
      'Locaciones urbanas y rurales, administración de alquileres y seguimiento contractual.',
  },
  {
    title: 'Tasaciones',
    description:
      'Valuaciones a precio de mercado, con métodos científicos según el tipo de inmueble.',
  },
  {
    title: 'Desarrollos y home staging',
    description:
      'Loteos, proyectos y puesta en valor para que tu propiedad se presente en su mejor versión.',
  },
  {
    title: 'Asesoría jurídica inmobiliaria',
    description:
      'Sucesiones, divorcios, desalojos y planificación impositiva junto a estudio jurídico y contable.',
  },
] as const;

export const ZONES = [
  { name: 'Zona Norte', detail: 'Tigre, Vicente López, Pilar y alrededores' },
  { name: 'CABA', detail: 'Operaciones con red de colegas en la Ciudad' },
  { name: 'Coronel Suárez', detail: 'Inmuebles urbanos, chacras y campos' },
  { name: 'Costa y Patagonia', detail: 'Consultas puntuales según operación' },
] as const;

export const PROCESS = [
  {
    step: '01',
    title: 'Escucha',
    description:
      'Entendemos tu objetivo: vender, alquilar, tasar o resolver una situación jurídica vinculada al inmueble.',
  },
  {
    step: '02',
    title: 'Diagnóstico',
    description:
      'Relevamos el bien, el mercado y los documentos. Si hace falta, coordinamos tasación profesional.',
  },
  {
    step: '03',
    title: 'Estrategia',
    description:
      'Definimos precio, canal y narrativa. Home staging y difusión cuando suman valor.',
  },
  {
    step: '04',
    title: 'Cierre',
    description:
      'Acompañamos negociación, reserva y escritura o contrato, con respaldo legal cuando lo necesitás.',
  },
] as const;

export const CREDENTIALS = [
  'Abogada — UBA (1998)',
  'Corredora, tasadora y martillera pública',
  'Matrícula 2227 CBB',
  'Cámara Inmobiliaria Argentina · Univ. de Morón',
  'Negociación y mediación — Colegio de Abogados de San Isidro',
] as const;

export const TESTIMONIALS = [
  {
    quote:
      'Nos acompañó en la venta de la casa familiar con claridad en cada paso. La tasación fue realista y el cierre, ordenado.',
    name: 'Familia R.',
    place: 'Vicente López',
  },
  {
    quote:
      'Necesitábamos resolver una sucesión antes de vender el campo. Coordinó lo jurídico y lo comercial sin vueltas.',
    name: 'Héctor M.',
    place: 'Coronel Suárez',
  },
  {
    quote:
      'Alquilamos un local con contratos claros y seguimiento. Se nota la experiencia de alguien que entiende el derecho inmobiliario.',
    name: 'Lucía P.',
    place: 'Santos Lugares',
  },
] as const;

export const FAQS = [
  {
    q: '¿Cuánto demora una tasación?',
    a: 'Según el tipo de inmueble y la documentación disponible. En muchos casos podemos avanzar con una valuación de mercado en el día o en pocas jornadas.',
  },
  {
    q: '¿Trabajan solo en Zona Norte?',
    a: 'Operamos fuerte en Zona Norte del GBA y en Coronel Suárez (urbano y rural). En CABA y otras zonas avanzamos con red de colegas según el caso.',
  },
  {
    q: '¿Pueden ayudar si hay una sucesión o divorcio de por medio?',
    a: 'Sí. Coordinamos con estudio jurídico para sucesiones, disolución de sociedad conyugal y la posterior venta del inmueble.',
  },
  {
    q: '¿Administran alquileres?',
    a: 'Sí. Ofrecemos intermediación y administración de alquileres, con seguimiento de contratos y conflictos habituales (deudas, expensas, desalojos).',
  },
] as const;

export const PROPERTIES: Property[] = [
  {
    id: '1',
    slug: 'casa-barrio-cerrado-tigre',
    title: 'Casa en barrio cerrado',
    location: 'Zona Norte, Tigre',
    operation: 'venta',
    type: 'casa',
    priceLabel: 'Consultar',
    beds: 4,
    baths: 3,
    areaLabel: '280 m²',
    highlight: 'Jardín y pileta',
    description:
      'Casa contemporánea en barrio cerrado de Tigre, con living-comedor integrado, cocina equipada, suite principal y jardín con pileta. Ideal para quienes buscan privacidad y amenities de club house a minutos de Acceso Norte.',
    amenities: [
      'Pileta',
      'Jardín perimetral',
      'Cochera doble',
      'Suite con vestidor',
      'Seguridad 24 hs',
      'Quincho',
    ],
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
        alt: 'Fachada de casa moderna con jardín',
        caption: 'Fachada principal',
      },
      {
        src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80',
        alt: 'Living luminoso con ventanales',
        caption: 'Living-comedor',
      },
      {
        src: 'https://images.unsplash.com/photo-1556912173-46c336c7fd55?auto=format&fit=crop&w=1600&q=80',
        alt: 'Cocina abierta con isla',
        caption: 'Cocina integrada',
      },
      {
        src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=80',
        alt: 'Dormitorio principal',
        caption: 'Suite principal',
      },
      {
        src: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1600&q=80',
        alt: 'Pileta y deck en el jardín',
        caption: 'Jardín y pileta',
      },
    ],
  },
  {
    id: '2',
    slug: 'departamento-luminoso-vicente-lopez',
    title: 'Departamento luminoso',
    location: 'Vicente López',
    operation: 'alquiler',
    type: 'departamento',
    priceLabel: 'USD 1.200 / mes',
    beds: 2,
    baths: 2,
    areaLabel: '85 m²',
    highlight: 'A estrenar',
    description:
      'Departamento a estrenar con orientación norte, balcón aterrazado y amenities. A pasos de Libertador, ideal para profesionales que buscan confort y buena conectividad.',
    amenities: [
      'Balcón aterrazado',
      'Cocina equipada',
      'Aire acondicionado',
      'Lavadero',
      'Cochera',
      'SUM y parrilla',
    ],
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80',
        alt: 'Living de departamento con ventanales',
        caption: 'Living principal',
      },
      {
        src: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80',
        alt: 'Dormitorio con luz natural',
        caption: 'Dormitorio',
      },
      {
        src: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1600&q=80',
        alt: 'Baño moderno',
        caption: 'Baño completo',
      },
      {
        src: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1600&q=80',
        alt: 'Balcón con vista abierta',
        caption: 'Balcón',
      },
    ],
  },
  {
    id: '3',
    slug: 'campo-productivo-coronel-suarez',
    title: 'Campo productivo',
    location: 'Coronel Suárez',
    operation: 'venta',
    type: 'campo',
    priceLabel: 'Consultar',
    areaLabel: '120 ha',
    highlight: 'Buena aptitud',
    description:
      'Campo de 120 hectáreas con buena aptitud agrícola-ganadera, aguadas naturales y acceso por camino consolidado.',
    amenities: [
      'Aguadas naturales',
      'Alambrados perimetrales',
      'Acceso consolidado',
      'Aptitud mixta',
      'Mejoras básicas',
    ],
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80',
        alt: 'Campo abierto con pasturas',
        caption: 'Vista general',
      },
      {
        src: 'https://images.unsplash.com/photo-1500937386664-56d1dfef385a?auto=format&fit=crop&w=1600&q=80',
        alt: 'Horizonte rural al atardecer',
        caption: 'Horizonte productivo',
      },
      {
        src: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1600&q=80',
        alt: 'Camino rural entre campos',
        caption: 'Acceso interno',
      },
      {
        src: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1600&q=80',
        alt: 'Pasturas verdes',
        caption: 'Pasturas',
      },
    ],
  },
  {
    id: '4',
    slug: 'lote-desarrollo-exaltacion',
    title: 'Lote en desarrollo',
    location: 'Exaltación de la Cruz',
    operation: 'venta',
    type: 'lote',
    priceLabel: 'USD 45.000',
    areaLabel: '800 m²',
    highlight: 'Servicios cerca',
    description:
      'Lote regular de 800 m² en zona de crecimiento, con servicios cercanos y buena orientación.',
    amenities: [
      'Medidas regulares',
      'Servicios próximos',
      'Buena orientación',
      'Zona residencial',
      'Escritura lista',
    ],
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1600&q=80',
        alt: 'Terreno amplio',
        caption: 'Vista del lote',
      },
      {
        src: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80',
        alt: 'Entorno natural',
        caption: 'Entorno',
      },
      {
        src: 'https://images.unsplash.com/photo-1449844908441-882987cb0c71?auto=format&fit=crop&w=1600&q=80',
        alt: 'Referencia de vivienda',
        caption: 'Potencial de obra',
      },
    ],
  },
  {
    id: '5',
    slug: 'local-comercial-santos-lugares',
    title: 'Local comercial',
    location: 'Santos Lugares',
    operation: 'alquiler',
    type: 'local',
    priceLabel: 'USD 900 / mes',
    areaLabel: '65 m²',
    highlight: 'Alta exposición',
    description:
      'Local a la calle con vidriera amplia, baño y depósito. Excelente circulación peatonal.',
    amenities: [
      'Vidriera a la calle',
      'Baño',
      'Depósito',
      'Alta circulación',
      'Zona comercial',
    ],
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
        alt: 'Interior de local comercial',
        caption: 'Salón principal',
      },
      {
        src: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80',
        alt: 'Espacio de trabajo abierto',
        caption: 'Planta libre',
      },
      {
        src: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1600&q=80',
        alt: 'Detalle de vidriera',
        caption: 'Vidriera',
      },
    ],
  },
  {
    id: '6',
    slug: 'casa-parque-coronel-suarez',
    title: 'Casa con parque',
    location: 'Coronel Suárez',
    operation: 'venta',
    type: 'casa',
    priceLabel: 'USD 185.000',
    beds: 3,
    baths: 2,
    areaLabel: '210 m²',
    highlight: 'Ideal familia',
    description:
      'Casa familiar con parque amplio, living luminoso, tres dormitorios y garage en barrio consolidado.',
    amenities: [
      'Parque frontal y fondo',
      'Garage',
      'Living comedor',
      'Cocina separada',
      'Calefacción',
      'Barrio consolidado',
    ],
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80',
        alt: 'Casa blanca con parque',
        caption: 'Fachada y parque',
      },
      {
        src: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80',
        alt: 'Living familiar',
        caption: 'Living',
      },
      {
        src: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80',
        alt: 'Cocina con mesada',
        caption: 'Cocina',
      },
      {
        src: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdbc?auto=format&fit=crop&w=1600&q=80',
        alt: 'Patio trasero',
        caption: 'Fondo',
      },
    ],
  },
  {
    id: '7',
    slug: 'ph-patio-olivos',
    title: 'PH con patio',
    location: 'Olivos',
    operation: 'alquiler',
    type: 'departamento',
    priceLabel: 'USD 1.450 / mes',
    beds: 3,
    baths: 2,
    areaLabel: '110 m²',
    highlight: 'Patio propio',
    description:
      'PH reciclado con patio propio, tres dormitorios y doble circulación. Tranquilo, cerca de Maipú.',
    amenities: [
      'Patio propio',
      'Reciclado reciente',
      'Lavadero',
      'Estar en planta baja',
      'Cerca de Maipú',
    ],
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80',
        alt: 'Living de PH',
        caption: 'Living',
      },
      {
        src: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80',
        alt: 'Cocina clara',
        caption: 'Cocina-comedor',
      },
      {
        src: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80',
        alt: 'Dormitorio',
        caption: 'Dormitorio',
      },
      {
        src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
        alt: 'Patio interior',
        caption: 'Patio',
      },
    ],
  },
  {
    id: '8',
    slug: 'chacra-casco-coronel-suarez',
    title: 'Chacra con casco',
    location: 'Coronel Suárez',
    operation: 'venta',
    type: 'campo',
    priceLabel: 'Consultar',
    beds: 4,
    baths: 3,
    areaLabel: '18 ha',
    highlight: 'Casco restaurado',
    description:
      'Chacra de 18 hectáreas con casco restaurado, parque arbolado y mejoras. Ideal fin de semana o pequeña producción.',
    amenities: [
      'Casco restaurado',
      'Parque arbolado',
      '4 dormitorios',
      'Galpón',
      'Pozo de agua',
      'Tranquera de acceso',
    ],
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1449844908441-882987cb0c71?auto=format&fit=crop&w=1600&q=80',
        alt: 'Casco de chacra',
        caption: 'Casco principal',
      },
      {
        src: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
        alt: 'Interior de casa de campo',
        caption: 'Interior del casco',
      },
      {
        src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
        alt: 'Galería y jardín',
        caption: 'Galería y jardín',
      },
      {
        src: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80',
        alt: 'Campo alrededor',
        caption: 'Entorno productivo',
      },
    ],
  },
];

export function getPropertyBySlug(slug: string) {
  return PROPERTIES.find((p) => p.slug === slug);
}

export function coverPhoto(property: Property) {
  return property.photos[0];
}
