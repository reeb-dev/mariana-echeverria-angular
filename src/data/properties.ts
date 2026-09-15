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
  offices: [
    {
      name: "Coronel Suárez",
      address: "Las Heras 1465, Coronel Suárez",
    },
    {
      name: "Sucursal Norte",
      address: "Av. de Todos los Santos 5600, Tigre",
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
      "Sucesiones, divorcios, desalojos y planificación impositiva en conjunto con estudio jurídico y contable.",
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
    image:
      "https://images.unsplash.com/photo-1628624747186-a941c476b7ef?auto=format&fit=crop&w=1200&q=80",
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
    image:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Casa con fachada blanca y parque frontal",
  },
];
