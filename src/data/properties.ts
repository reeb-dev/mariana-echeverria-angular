export type PropertyOperation = "venta" | "alquiler";
export type PropertyType =
  | "casa"
  | "departamento"
  | "campo"
  | "lote"
  | "local";

export type Property = {
  id: string;
  title: string;
  location: string;
  operation: PropertyOperation;
  type: PropertyType;
  priceLabel: string;
  beds?: number;
  baths?: number;
  areaLabel: string;
  highlight?: string;
  image: string;
  imageAlt: string;
};

export const CONTACT = {
  brand: "Mariana Echeverría",
  tagline: "Bienes Raíces",
  phoneDisplay: "11 6591 1565",
  phoneSecondary: "02926 460944",
  whatsappUrl: "https://wa.me/5491165911565",
  email: "marianalecheverria@gmail.com",
  instagram: "marianaecheverriainmob",
  instagramUrl: "https://www.instagram.com/marianaecheverriainmob/",
  matricula: "Mat. 2227 CBB",
  years: "25+",
  offices: [
    {
      name: "Coronel Suárez",
      address: "Las Heras 1465, Coronel Suárez",
      detail: "Urbano y rural · Sudoeste bonaerense",
    },
    {
      name: "Sucursal Norte",
      address: "Av. de Todos los Santos 5600, Tigre",
      detail: "Zona Norte del GBA · Vicente López a Exaltación",
    },
  ],
} as const;

export const SERVICES = [
  {
    title: "Venta",
    description:
      "Intermediación personalizada en viviendas, comercios y campos, con acompañamiento legal de punta a punta.",
  },
  {
    title: "Alquiler y arrendamientos",
    description:
      "Locaciones urbanas y rurales, administración de alquileres y seguimiento contractual.",
  },
  {
    title: "Tasaciones",
    description:
      "Valuaciones a precio de mercado, con métodos científicos según el tipo de inmueble.",
  },
  {
    title: "Desarrollos y home staging",
    description:
      "Loteos, proyectos y puesta en valor para que tu propiedad se presente en su mejor versión.",
  },
  {
    title: "Asesoría jurídica inmobiliaria",
    description:
      "Sucesiones, divorcios, desalojos y planificación impositiva junto a estudio jurídico y contable.",
  },
] as const;

export const ZONES = [
  {
    name: "Zona Norte",
    detail: "Tigre, Vicente López, Pilar y alrededores",
  },
  {
    name: "CABA",
    detail: "Operaciones con red de colegas en la Ciudad",
  },
  {
    name: "Coronel Suárez",
    detail: "Inmuebles urbanos, chacras y campos",
  },
  {
    name: "Costa y Patagonia",
    detail: "Consultas puntuales según operación",
  },
] as const;

export const PROCESS = [
  {
    step: "01",
    title: "Escucha",
    description:
      "Entendemos tu objetivo: vender, alquilar, tasar o resolver una situación jurídica vinculada al inmueble.",
  },
  {
    step: "02",
    title: "Diagnóstico",
    description:
      "Relevamos el bien, el mercado y los documentos. Si hace falta, coordinamos tasación profesional.",
  },
  {
    step: "03",
    title: "Estrategia",
    description:
      "Definimos precio, canal y narrativa. Home staging y difusión cuando suman valor.",
  },
  {
    step: "04",
    title: "Cierre",
    description:
      "Acompañamos negociación, reserva y escritura o contrato, con respaldo legal cuando lo necesitás.",
  },
] as const;

export const CREDENTIALS = [
  "Abogada — UBA (1998)",
  "Corredora, tasadora y martillera pública",
  "Matrícula 2227 CBB",
  "Cámara Inmobiliaria Argentina · Univ. de Morón",
  "Negociación y mediación — Colegio de Abogados de San Isidro",
] as const;

export const TESTIMONIALS = [
  {
    quote:
      "Nos acompañó en la venta de la casa familiar con claridad en cada paso. La tasación fue realista y el cierre, ordenado.",
    name: "Familia R.",
    place: "Vicente López",
  },
  {
    quote:
      "Necesitábamos resolver una sucesión antes de vender el campo. Coordinó lo jurídico y lo comercial sin vueltas.",
    name: "Héctor M.",
    place: "Coronel Suárez",
  },
  {
    quote:
      "Alquilamos un local con contratos claros y seguimiento. Se nota la experiencia de alguien que entiende el derecho inmobiliario.",
    name: "Lucía P.",
    place: "Santos Lugares",
  },
] as const;

export const FAQS = [
  {
    q: "¿Cuánto demora una tasación?",
    a: "Según el tipo de inmueble y la documentación disponible. En muchos casos podemos avanzar con una valuación de mercado en el día o en pocas jornadas.",
  },
  {
    q: "¿Trabajan solo en Zona Norte?",
    a: "Operamos fuerte en Zona Norte del GBA y en Coronel Suárez (urbano y rural). En CABA y otras zonas avanzamos con red de colegas según el caso.",
  },
  {
    q: "¿Pueden ayudar si hay una sucesión o divorcio de por medio?",
    a: "Sí. Coordinamos con estudio jurídico para sucesiones, disolución de sociedad conyugal y la posterior venta del inmueble.",
  },
  {
    q: "¿Administran alquileres?",
    a: "Sí. Ofrecemos intermediación y administración de alquileres, con seguimiento de contratos y conflictos habituales (deudas, expensas, desalojos).",
  },
] as const;

export const PROPERTIES: Property[] = [
  {
    id: "1",
    title: "Casa en barrio cerrado",
    location: "Zona Norte, Tigre",
    operation: "venta",
    type: "casa",
    priceLabel: "Consultar",
    beds: 4,
    baths: 3,
    areaLabel: "280 m²",
    highlight: "Jardín y pileta",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Casa moderna con jardín en barrio cerrado",
  },
  {
    id: "2",
    title: "Departamento luminoso",
    location: "Vicente López",
    operation: "alquiler",
    type: "departamento",
    priceLabel: "USD 1.200 / mes",
    beds: 2,
    baths: 2,
    areaLabel: "85 m²",
    highlight: "A estrenar",
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Living de departamento luminoso con ventanales",
  },
  {
    id: "3",
    title: "Campo productivo",
    location: "Coronel Suárez",
    operation: "venta",
    type: "campo",
    priceLabel: "Consultar",
    areaLabel: "120 ha",
    highlight: "Buena aptitud",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Campo abierto con pasturas bajo cielo amplio",
  },
  {
    id: "4",
    title: "Lote en desarrollo",
    location: "Exaltación de la Cruz",
    operation: "venta",
    type: "lote",
    priceLabel: "USD 45.000",
    areaLabel: "800 m²",
    highlight: "Servicios cerca",
    image:
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Terreno amplio listo para construir",
  },
  {
    id: "5",
    title: "Local comercial",
    location: "Santos Lugares",
    operation: "alquiler",
    type: "local",
    priceLabel: "USD 900 / mes",
    areaLabel: "65 m²",
    highlight: "Alta exposición",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Local comercial con vidriera a la calle",
  },
  {
    id: "6",
    title: "Casa con parque",
    location: "Coronel Suárez",
    operation: "venta",
    type: "casa",
    priceLabel: "USD 185.000",
    beds: 3,
    baths: 2,
    areaLabel: "210 m²",
    highlight: "Ideal familia",
    image:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Casa con fachada blanca y parque frontal",
  },
  {
    id: "7",
    title: "PH con patio",
    location: "Olivos",
    operation: "alquiler",
    type: "departamento",
    priceLabel: "USD 1.450 / mes",
    beds: 3,
    baths: 2,
    areaLabel: "110 m²",
    highlight: "Patio propio",
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Interior de PH luminoso con living amplio",
  },
  {
    id: "8",
    title: "Chacra con casco",
    location: "Coronel Suárez",
    operation: "venta",
    type: "campo",
    priceLabel: "Consultar",
    beds: 4,
    baths: 3,
    areaLabel: "18 ha",
    highlight: "Casco restaurado",
    image:
      "https://images.unsplash.com/photo-1449844908441-882987cb0c71?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Casa de campo rodeada de árbolado",
  },
];
