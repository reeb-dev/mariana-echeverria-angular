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
  instagram: 'marianaecheverriacs',
  instagramUrl: 'https://www.instagram.com/marianaecheverriacs/',
  matricula: 'Mat. 2227 CBB',
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
      'Armamos fotos, texto y difusión — el mismo criterio que ves en @marianaecheverriacs.',
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
  'Ventas · alquileres · tasaciones (bio de @marianaecheverriacs)',
  '25 años de servicios profesionales personalizados',
  'Oficinas en Coronel Suárez y Sucursal Norte (Tigre)',
] as const;

/** Destacados del perfil @marianaecheverriacs (bio + highlights) */
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

export const TESTIMONIALS = [
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
] as const;

export const FAQS = [
  {
    q: '¿Hacen tasaciones en el día?',
    a: 'Sí. Según el tipo de inmueble y la documentación, en muchos casos entregamos valuación de mercado el mismo día — es uno de los servicios que más pedís por Instagram y WhatsApp.',
  },
  {
    q: '¿Publican en Instagram todas las propiedades?',
    a: 'La mayoría de los avisos activos se difunden en @marianaecheverriacs: venta, alquiler, lotes y novedades de tasación. Acá en la web tenés la ficha con galería completa.',
  },
  {
    q: '¿Trabajan Coronel Suárez y Zona Norte?',
    a: 'Sí. Oficina en Las Heras 1465 (Coronel Suárez) y Sucursal Norte en Av. de Todos los Santos 5600 (Tigre), con operaciones en Nordelta y alrededores.',
  },
  {
    q: '¿Qué es el home staging?',
    a: 'Es la puesta en valor antes de publicar: orden, luz y encuadre para que el aviso se vea atractivo en fotos — clave cuando el primer contacto es por Instagram.',
  },
] as const;

/** Inventario demo inspirado en el mix que publica: CS urbano, lotes, alquileres, Zona Norte */
export const PROPERTIES: Property[] = [
  {
    id: '1',
    slug: 'casa-mitre-coronel-suarez',
    title: 'Casa en venta – Mitre 2000',
    location: 'Coronel Suárez',
    operation: 'venta',
    type: 'casa',
    priceLabel: 'USD 54.000',
    beds: 3,
    baths: 2,
    areaLabel: '180 m²',
    highlight: 'Publicado en el feed',
    description:
      'Casa en Mitre 2000, Coronel Suárez. Living-comedor, cocina, dormitorios y patio. Aviso al estilo de los que publica en Instagram: precio visible, fotos claras y consulta directa por WhatsApp.',
    amenities: ['Patio', 'Garage', 'Cocina separada', 'Barrio consolidado', 'Cerca del centro'],
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80',
        alt: 'Fachada de casa con jardín',
        caption: 'Fachada',
      },
      {
        src: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80',
        alt: 'Living familiar',
        caption: 'Living',
      },
      {
        src: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80',
        alt: 'Cocina',
        caption: 'Cocina',
      },
      {
        src: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdbc?auto=format&fit=crop&w=1600&q=80',
        alt: 'Patio',
        caption: 'Patio',
      },
    ],
  },
  {
    id: '2',
    slug: 'departamento-rivas-alquiler',
    title: 'Excelente departamento – Rivas 200',
    location: 'Coronel Suárez',
    operation: 'alquiler',
    type: 'departamento',
    priceLabel: '$ 1.200.000 / mes',
    beds: 2,
    baths: 1,
    areaLabel: '65 m²',
    highlight: 'Alquiler activo',
    description:
      'Departamento en Rivas 200, listo para habitar. Dos dormitorios, living y cocina. Formato típico de alquiler en el feed: ubicación, precio mensual y consulta rápida.',
    amenities: ['Luminoso', 'Cocina equipada', 'Cerca de servicios', 'Segundo piso'],
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80',
        alt: 'Living de departamento',
        caption: 'Living',
      },
      {
        src: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80',
        alt: 'Dormitorio',
        caption: 'Dormitorio',
      },
      {
        src: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1600&q=80',
        alt: 'Baño',
        caption: 'Baño',
      },
      {
        src: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80',
        alt: 'Cocina',
        caption: 'Cocina',
      },
    ],
  },
  {
    id: '3',
    slug: 'lote-sierra-de-la-ventana',
    title: 'Terreno/lote – Juan Bautista Gil',
    location: 'Sierra de la Ventana',
    operation: 'venta',
    type: 'lote',
    priceLabel: 'USD 21.000',
    areaLabel: 'Consultar medidas',
    highlight: 'Para proyecto',
    description:
      'Lote en Juan Bautista Gil, Sierra de la Ventana. Ideal vivienda de fin de semana o inversión. Mismo criterio de los avisos de terrenos del Instagram: ubicación, precio y contacto inmediato.',
    amenities: ['Entorno serrano', 'Para construir', 'Inversión', 'Escritura'],
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1600&q=80',
        alt: 'Terreno con horizonte',
        caption: 'Vista del lote',
      },
      {
        src: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80',
        alt: 'Entorno natural',
        caption: 'Entorno',
      },
      {
        src: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1600&q=80',
        alt: 'Camino de acceso',
        caption: 'Acceso',
      },
    ],
  },
  {
    id: '4',
    slug: 'local-belgrano-alquiler',
    title: 'Local en alquiler – Belgrano 1200',
    location: 'Coronel Suárez',
    operation: 'alquiler',
    type: 'local',
    priceLabel: '$ 1.200.000 / mes',
    areaLabel: 'Consultar',
    highlight: 'Vidriera a la calle',
    description:
      'Local comercial en Belgrano 1200 con buena exposición. Apto comercio o servicio profesional. Aviso al estilo Instagram: ubicación, precio y WhatsApp.',
    amenities: ['Vidriera', 'Zona comercial', 'Baño', 'Alta circulación'],
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
        alt: 'Interior de local',
        caption: 'Salón',
      },
      {
        src: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80',
        alt: 'Espacio abierto',
        caption: 'Planta',
      },
      {
        src: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1600&q=80',
        alt: 'Vidriera',
        caption: 'Frente',
      },
    ],
  },
  {
    id: '5',
    slug: 'chalet-nordelta',
    title: 'Chalet en Nordelta',
    location: 'Av. de los Lagos, Nordelta, Tigre',
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
        src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
        alt: 'Chalet moderno con pileta',
        caption: 'Fachada',
      },
      {
        src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80',
        alt: 'Living',
        caption: 'Living',
      },
      {
        src: 'https://images.unsplash.com/photo-1556912173-46c336c7fd55?auto=format&fit=crop&w=1600&q=80',
        alt: 'Cocina',
        caption: 'Cocina',
      },
      {
        src: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1600&q=80',
        alt: 'Pileta',
        caption: 'Pileta',
      },
      {
        src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=80',
        alt: 'Suite',
        caption: 'Suite',
      },
    ],
  },
  {
    id: '6',
    slug: 'depto-paseo-victorica-tigre',
    title: 'Depto en venta – Paseo Victorica',
    location: 'Paseo Victorica, Tigre',
    operation: 'venta',
    type: 'departamento',
    priceLabel: 'Consultar',
    beds: 2,
    baths: 2,
    areaLabel: '75 m²',
    highlight: 'Frente al río',
    description:
      'Departamento en Paseo Victorica, Tigre. Ubicación sobre el río, ideal vivienda o inversión. Representa la línea Zona Norte que comparte en el feed junto a los avisos de Coronel Suárez.',
    amenities: ['Vista abierta', 'Balcón', 'Amenities', 'Cerca del centro de Tigre'],
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80',
        alt: 'Living con luz',
        caption: 'Living',
      },
      {
        src: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80',
        alt: 'Dormitorio',
        caption: 'Dormitorio',
      },
      {
        src: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1600&q=80',
        alt: 'Balcón',
        caption: 'Balcón',
      },
      {
        src: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1600&q=80',
        alt: 'Baño',
        caption: 'Baño',
      },
    ],
  },
  {
    id: '7',
    slug: 'lotes-san-jose-berutti',
    title: 'Lotes en San José',
    location: 'Berutti / Pueblo San José',
    operation: 'venta',
    type: 'lote',
    priceLabel: 'USD 13.650',
    areaLabel: 'Últimos lotes',
    highlight: 'Desarrollo',
    description:
      'Últimos lotes en desarrollo de San José (Berutti). Precio accesible para quien busca terreno propio. Mensaje típico de campaña en Instagram: urgencia, ubicación y valor.',
    amenities: ['Servicios cercanos', 'Financiación a consultar', 'Zona en crecimiento'],
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80',
        alt: 'Lote abierto',
        caption: 'Lote',
      },
      {
        src: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1600&q=80',
        alt: 'Horizonte',
        caption: 'Entorno',
      },
      {
        src: 'https://images.unsplash.com/photo-1449844908441-882987cb0c71?auto=format&fit=crop&w=1600&q=80',
        alt: 'Referencia de vivienda',
        caption: 'Potencial',
      },
    ],
  },
  {
    id: '8',
    slug: 'campo-arrendamiento-sudoeste',
    title: 'Campo para arrendamiento',
    location: 'Partido de Coronel Suárez',
    operation: 'alquiler',
    type: 'campo',
    priceLabel: 'Consultar',
    areaLabel: 'Según padrón',
    highlight: 'Arrendamiento rural',
    description:
      'Campo disponible para arrendamiento en el partido. Operaciones rurales con la misma seriedad que las urbanas: contrato claro y seguimiento. También publicamos este tipo de aviso en el feed.',
    amenities: ['Aptitud mixta', 'Acceso consolidado', 'Contrato de arrendamiento'],
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80',
        alt: 'Campo',
        caption: 'Vista general',
      },
      {
        src: 'https://images.unsplash.com/photo-1500937386664-56d1dfef385a?auto=format&fit=crop&w=1600&q=80',
        alt: 'Horizonte rural',
        caption: 'Horizonte',
      },
      {
        src: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1600&q=80',
        alt: 'Camino rural',
        caption: 'Acceso',
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
