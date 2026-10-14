/**
 * Guías (`/guias`). Texto general y orientativo, sin cifras ni plazos: cada caso depende de la jurisdicción y de la
 * documentación. Son un borrador para que la titular (abogada) los revise y ajuste antes de darlos por definitivos.
 *
 * Datos puros, sin dependencias, para que `tools/postbuild.mjs` los pueda leer.
 */
export type GuideSection = {
  heading: string;
  paragraphs?: string[];
  list?: string[];
};

export type Guide = {
  slug: string;
  title: string;
  /** Para Google y para compartir. */
  description: string;
  minutes: number;
  intro: string;
  sections: GuideSection[];
};

export const GUIDES: Guide[] = [
  {
    slug: 'papeles-para-vender-una-propiedad',
    title: 'Qué papeles necesito para vender una propiedad',
    description:
      'La documentación que conviene tener lista antes de publicar una propiedad: título, certificados, deudas e información de los dueños.',
    minutes: 4,
    intro:
      'Tener la documentación ordenada antes de publicar acorta los tiempos y evita sorpresas en la escritura. Esta es una lista general: según el caso pueden pedirse más papeles.',
    sections: [
      {
        heading: 'Sobre quién vende',
        list: [
          'DNI de todos los titulares y estado civil de cada uno.',
          'Si hay un poder, el documento que acredita quién puede firmar.',
          'Si el titular falleció, la documentación de la sucesión.',
        ],
      },
      {
        heading: 'Sobre la propiedad',
        list: [
          'Título de propiedad (escritura) o documento que acredite el dominio.',
          'Datos catastrales y número de partida.',
          'Planos y, si hubo obra, la documentación de lo construido.',
          'Reglamento de copropiedad y estado de expensas, si es un departamento.',
        ],
      },
      {
        heading: 'Deudas e impuestos',
        list: [
          'Comprobantes al día de impuestos y tasas municipales e inmobiliarias.',
          'Servicios al día.',
          'Si hay una hipoteca u otra deuda inscripta, su estado y cómo se cancela.',
        ],
      },
      {
        heading: 'Lo que pide la escribanía',
        paragraphs: [
          'La escribanía solicita certificados que acreditan que el dueño puede disponer del inmueble y que no tiene restricciones. Conviene consultar con tiempo cuáles corresponden a tu caso.',
        ],
      },
      {
        heading: 'Antes de publicar',
        paragraphs: [
          'Una tasación realista y la documentación a mano permiten publicar con un precio razonable y responder rápido a quien se interesa. Si querés, te ayudamos a revisar qué falta.',
        ],
      },
    ],
  },
  {
    slug: 'sucesion-con-una-propiedad',
    title: 'Cómo es una sucesión cuando hay una propiedad',
    description:
      'Qué pasos suelen seguirse en una sucesión con un inmueble, qué documentación se necesita y por qué conviene asesorarse desde el principio.',
    minutes: 5,
    intro:
      'Cuando una persona fallece y deja un inmueble, hay que ordenar la titularidad antes de poder venderlo o escriturarlo. Los pasos y los tiempos dependen de cada caso, así que esto es una guía general.',
    sections: [
      {
        heading: 'Para empezar',
        paragraphs: [
          'El primer paso es reunir la documentación básica y definir quiénes son las personas con derecho a heredar. Un abogado puede orientarte sobre cómo se inicia el trámite según tu situación.',
        ],
      },
      {
        heading: 'Documentación que suele pedirse',
        list: [
          'Partida de defunción.',
          'Partidas de nacimiento y de matrimonio de las personas que heredan.',
          'Título de propiedad y datos catastrales del inmueble.',
          'Certificados de dominio e inhibiciones.',
          'Comprobantes de impuestos y tasas.',
        ],
      },
      {
        heading: 'La declaratoria de herederos y el inventario',
        paragraphs: [
          'La justicia reconoce quiénes son las personas herederas y se detallan los bienes de la sucesión. Recién entonces el inmueble puede inscribirse a nombre de quienes heredan.',
        ],
      },
      {
        heading: 'Vender una propiedad de una sucesión',
        paragraphs: [
          'Si la idea es vender, conviene tener una tasación actualizada para acordar el valor entre las personas herederas y preparar la documentación para la escritura. Hacerlo con asesoramiento legal evita demoras y desacuerdos.',
        ],
      },
    ],
  },
  {
    slug: 'gastos-de-comprar-o-vender',
    title: 'Qué gastos tiene comprar o vender una propiedad',
    description:
      'Un panorama de los costos que aparecen además del precio: honorarios, impuestos y escribanía, y cómo estimarlos antes de decidir.',
    minutes: 3,
    intro:
      'Además del precio, una operación inmobiliaria tiene gastos. Conocerlos de antemano permite decidir con más información. Los montos dependen de cada operación, por eso esta guía no da cifras.',
    sections: [
      {
        heading: 'Gastos de quien compra',
        list: [
          'Honorarios de la inmobiliaria.',
          'Impuestos y sellados que corresponden a la compra.',
          'Escribanía y gastos de inscripción.',
          'Certificados y trámites.',
        ],
      },
      {
        heading: 'Gastos de quien vende',
        list: [
          'Honorarios de la inmobiliaria.',
          'Impuestos que correspondan a la venta.',
          'Cancelación de deudas o hipotecas, si las hay.',
          'Documentación e informes que se necesiten para escriturar.',
        ],
      },
      {
        heading: 'Cómo estimarlos',
        paragraphs: [
          'En la página de calculadoras podés simular los gastos de una compra y lo que hace falta para entrar a un alquiler. Los porcentajes son de referencia y se pueden cambiar. Para una cifra exacta, consultá con la escribanía.',
        ],
      },
    ],
  },
];
