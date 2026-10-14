/**
 * Modelos base de documentos. Son puntos de partida para que la abogada los revise y ajuste a cada operación:
 * no son asesoramiento legal ni reemplazan un contrato redactado para el caso.
 */
export type TemplateField = {
  key: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'number' | 'date' | 'textarea';
};

export type DocumentTemplate = {
  id: string;
  title: string;
  description: string;
  fields: TemplateField[];
  /** Texto con marcadores {{clave}}. */
  body: string;
};

const COMMON_PARTY: TemplateField[] = [
  { key: 'ciudad', label: 'Ciudad', placeholder: 'Coronel Suárez' },
  { key: 'fecha', label: 'Fecha', type: 'date' },
];

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'autorizacion-venta',
    title: 'Autorización de venta',
    description: 'Autoriza a la inmobiliaria a ofrecer el inmueble, con plazo y comisión.',
    fields: [
      ...COMMON_PARTY,
      { key: 'propietario', label: 'Propietario (nombre completo)' },
      { key: 'dni_propietario', label: 'DNI del propietario' },
      { key: 'inmueble', label: 'Inmueble (dirección y datos catastrales)', type: 'textarea' },
      { key: 'precio', label: 'Precio de venta', placeholder: 'USD 54.000' },
      { key: 'plazo', label: 'Plazo de la autorización (días)', type: 'number', placeholder: '90' },
      { key: 'comision', label: 'Comisión (%)', type: 'number', placeholder: '3' },
      { key: 'exclusiva', label: '¿Con exclusividad? (sí o no)', placeholder: 'sí' },
    ],
    body: `AUTORIZACIÓN DE VENTA

En {{ciudad}}, a {{fecha}}, el/la Sr./Sra. {{propietario}}, DNI {{dni_propietario}}, en adelante EL PROPIETARIO, autoriza a Mariana Echeverría Bienes Raíces, corredora inmobiliaria matriculada, en adelante LA INMOBILIARIA, a ofrecer en venta el siguiente inmueble:

{{inmueble}}

PRIMERA — PRECIO: El precio de venta autorizado es de {{precio}}. Toda oferta distinta deberá ser consultada y aceptada por EL PROPIETARIO.

SEGUNDA — PLAZO: La presente autorización rige por {{plazo}} días corridos desde su fecha, {{exclusiva}} exclusividad.

TERCERA — COMISIÓN: Si la operación se concreta por intermedio de LA INMOBILIARIA, EL PROPIETARIO abonará una comisión del {{comision}}% sobre el precio de la operación, más los impuestos que correspondan, según la normativa vigente.

CUARTA — OBLIGACIONES: EL PROPIETARIO declara ser titular del inmueble, que no pesan sobre él medidas que impidan su venta y se compromete a entregar la documentación necesaria.

Previa lectura, firman las partes en prueba de conformidad.



_______________________            _______________________
EL PROPIETARIO                     LA INMOBILIARIA`,
  },
  {
    id: 'boleto-reserva',
    title: 'Reserva de compra',
    description: 'Recibo de seña y reserva de un inmueble mientras se prepara el boleto.',
    fields: [
      ...COMMON_PARTY,
      { key: 'comprador', label: 'Interesado (nombre completo)' },
      { key: 'dni_comprador', label: 'DNI del interesado' },
      { key: 'propietario', label: 'Propietario' },
      { key: 'inmueble', label: 'Inmueble', type: 'textarea' },
      { key: 'precio', label: 'Precio ofrecido', placeholder: 'USD 52.000' },
      { key: 'sena', label: 'Importe de la reserva', placeholder: 'USD 1.000' },
      { key: 'vigencia', label: 'Vigencia de la reserva (días)', type: 'number', placeholder: '7' },
    ],
    body: `RESERVA DE COMPRA

En {{ciudad}}, a {{fecha}}, el/la Sr./Sra. {{comprador}}, DNI {{dni_comprador}}, en adelante EL INTERESADO, entrega a Mariana Echeverría Bienes Raíces la suma de {{sena}} en concepto de reserva del inmueble:

{{inmueble}}

propiedad de {{propietario}}, por el precio ofrecido de {{precio}}.

PRIMERA: La reserva queda sujeta a la aceptación de la oferta por parte del propietario y tiene una vigencia de {{vigencia}} días corridos.

SEGUNDA: Aceptada la oferta, la suma entregada se imputará a cuenta del precio al firmarse el boleto de compraventa.

TERCERA: Si el propietario no acepta la oferta dentro del plazo, la suma será devuelta íntegramente al interesado.

Previa lectura, firman en prueba de conformidad.



_______________________            _______________________
EL INTERESADO                      LA INMOBILIARIA`,
  },
  {
    id: 'locacion-urbana',
    title: 'Contrato de locación (vivienda o local)',
    description: 'Modelo base de alquiler urbano con precio, plazo, ajuste y depósito.',
    fields: [
      ...COMMON_PARTY,
      { key: 'locador', label: 'Locador (propietario)' },
      { key: 'locatario', label: 'Locatario (inquilino)' },
      { key: 'garante', label: 'Garante' },
      { key: 'inmueble', label: 'Inmueble', type: 'textarea' },
      { key: 'destino', label: 'Destino', placeholder: 'vivienda familiar' },
      { key: 'inicio', label: 'Fecha de inicio', type: 'date' },
      { key: 'meses', label: 'Duración (meses)', type: 'number', placeholder: '24' },
      { key: 'alquiler', label: 'Alquiler mensual', placeholder: '$ 1.200.000' },
      { key: 'ajuste', label: 'Regla de ajuste', placeholder: 'trimestral según el índice pactado' },
      { key: 'deposito', label: 'Depósito en garantía', placeholder: '$ 1.200.000' },
    ],
    body: `CONTRATO DE LOCACIÓN

En {{ciudad}}, a {{fecha}}, entre {{locador}}, en adelante EL LOCADOR, y {{locatario}}, en adelante EL LOCATARIO, con la garantía de {{garante}}, se celebra el presente contrato de locación sobre el inmueble:

{{inmueble}}

PRIMERA — DESTINO: El inmueble se destina exclusivamente a {{destino}}.

SEGUNDA — PLAZO: El contrato tiene una duración de {{meses}} meses a partir del {{inicio}}.

TERCERA — PRECIO Y AJUSTE: El alquiler mensual es de {{alquiler}}, con ajuste {{ajuste}}. Se abona del 1 al 10 de cada mes.

CUARTA — DEPÓSITO: EL LOCATARIO entrega {{deposito}} en concepto de depósito en garantía, que se restituirá al finalizar la locación, previa verificación del estado del inmueble.

QUINTA — SERVICIOS E IMPUESTOS: Los servicios y las expensas ordinarias están a cargo de EL LOCATARIO; los impuestos y tasas que gravan la propiedad, a cargo de EL LOCADOR, salvo pacto en contrario.

SEXTA — OBLIGACIONES: EL LOCATARIO conservará el inmueble en buen estado y no podrá subalquilarlo ni ceder el contrato sin autorización escrita.

SÉPTIMA — RESCISIÓN: Cualquiera de las partes podrá rescindir en los términos que establece la normativa vigente.

Previa lectura, firman tres ejemplares de un mismo tenor.



_______________________    _______________________    _______________________
EL LOCADOR                 EL LOCATARIO               EL GARANTE`,
  },
  {
    id: 'arrendamiento-rural',
    title: 'Contrato de arrendamiento rural',
    description: 'Modelo base para campos: superficie, plazo, canon y destino.',
    fields: [
      ...COMMON_PARTY,
      { key: 'arrendador', label: 'Arrendador' },
      { key: 'arrendatario', label: 'Arrendatario' },
      { key: 'campo', label: 'Campo (ubicación, partida, superficie)', type: 'textarea' },
      { key: 'destino', label: 'Destino', placeholder: 'agricultura y ganadería' },
      { key: 'inicio', label: 'Fecha de inicio', type: 'date' },
      { key: 'anios', label: 'Duración (años)', type: 'number', placeholder: '3' },
      { key: 'canon', label: 'Canon', placeholder: '12 quintales de soja por hectárea y por año' },
      { key: 'pago', label: 'Forma y fechas de pago', placeholder: 'dos cuotas, en marzo y en septiembre' },
    ],
    body: `CONTRATO DE ARRENDAMIENTO RURAL

En {{ciudad}}, a {{fecha}}, entre {{arrendador}}, en adelante EL ARRENDADOR, y {{arrendatario}}, en adelante EL ARRENDATARIO, se celebra el presente contrato de arrendamiento rural sobre el siguiente inmueble:

{{campo}}

PRIMERA — DESTINO: El campo se destina a {{destino}}, debiendo EL ARRENDATARIO explotarlo racionalmente y conservar el suelo.

SEGUNDA — PLAZO: El arrendamiento rige por {{anios}} años desde el {{inicio}}.

TERCERA — CANON: El canon es de {{canon}}, pagadero {{pago}}.

CUARTA — MEJORAS: Las mejoras que EL ARRENDATARIO desee introducir requieren autorización escrita de EL ARRENDADOR.

QUINTA — IMPUESTOS: El impuesto inmobiliario rural y las tasas que gravan el campo están a cargo de EL ARRENDADOR; los gastos de explotación, a cargo de EL ARRENDATARIO.

SEXTA — RESTITUCIÓN: Al vencer el plazo, EL ARRENDATARIO devolverá el campo en las condiciones recibidas, salvo el desgaste normal.

Previa lectura, firman dos ejemplares de un mismo tenor.



_______________________            _______________________
EL ARRENDADOR                      EL ARRENDATARIO`,
  },
];

/** Reemplaza cada {{clave}} por su valor; las que quedan vacías se dejan marcadas para completar. */
export function renderTemplate(body: string, values: Record<string, string>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const raw = (values[key] ?? '').trim();
    // Las fechas del formulario vienen como 2026-10-14: en el documento van como 14/10/2026.
    const value = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw.split('-').reverse().join('/') : raw;
    return value ? value : `[${key.replace(/_/g, ' ')}]`;
  });
}
