# Mariana Echeverría Bienes Raíces — Demo Angular

Rediseño demo en **Angular 19** + Tailwind, alineado a [marianaecheverria.com.ar](https://www.marianaecheverria.com.ar/) e Instagram [@coronelsuarezbienesraices](https://www.instagram.com/coronelsuarezbienesraices/).

No es el sitio oficial.

## Stack

- Angular 19 (standalone components)
- Tailwind CSS 3
- Tipografía: Libre Baskerville (marca/títulos) + Source Sans 3 (cuerpo)
- Angular Router (landing + fichas `/propiedades/:slug`)

## Cómo correrlo

```bash
npm install
npm start
```

Abrí [http://127.0.0.1:43127](http://127.0.0.1:43127).

Build de producción:

```bash
npm run build
```

## Deploy (GitHub Pages)

La demo se publica con GitHub Actions (`.github/workflows/deploy-pages.yml`) en:

**https://reeb-dev.github.io/mariana-echeverria-angular/**

Requisitos en el repo GitHub `reeb-dev/mariana-echeverria-angular` (público):

1. Settings → Pages → Source: **GitHub Actions**
2. Push a `main` (o *Actions → Deploy GitHub Pages → Run workflow*)

El `baseHref` de producción es `/mariana-echeverria-angular/`. El workflow copia `index.html` a `404.html` para el router SPA.

Build local equivalente a CI:

```bash
npm run build:pages
```

## Fotos de propiedades

Las galerías en `public/properties/` son avisos públicos del circuito CS (`coronelsuarezpropiedades.com.ar`), alineados por tipo/zona. Zona Norte: Unsplash. Instagram `@coronelsuarezbienesraices` exige login — **no** son fotos del IG. Ver `public/properties/SOURCES.md`.

## Contenido (inspirado en el feed de Instagram)

- Hero con marca clara, sin tipografías superpuestas
- Servicios: venta, alquiler/arrendamientos, tasaciones en el día, home staging, derecho inmobiliario
- Avisos demo al estilo del feed (Mitre, Rivas, Sierra de la Ventana, Nordelta, Paseo Victorica, etc.)
- Bloque “Lo que más publica” con los ejes del Instagram
- Ficha de propiedad con galería, WhatsApp flotante y formulario a WhatsApp

## Panel y destacadas

- **Panel:** `/panel` (no está enlazado en el menú público; pide ingresar). Lista, alta, edición y baja de propiedades, estado
  (publicada, pausada, vendida, alquilada), fotos desde el celular o la computadora (se achican solas), destacadas con orden y
  copia de seguridad en JSON.
- **Destacadas en la home:** sección `#destacadas`, con las propiedades publicadas marcadas como destacadas (hasta 6), en el
  orden elegido en el panel.
- **Datos:** `src/app/data/property-store.ts` guarda en el navegador (localStorage) a partir del inventario de ejemplo de
  `properties.ts`. Es una versión de demostración: sin servidor, los cambios no se ven desde otro dispositivo. Para pasar a la
  base de datos real solo cambian `load()` y `commit()` del store.
- **Tipos de usuario** (`src/app/data/permissions.ts`): *titular* (todo, incluidos usuarios y copias), *agente* (crea y edita
  sus propias propiedades, cambia su estado y atiende consultas; no elimina ni destaca) y *solo consulta* (solo mira).
- **Consultas:** el formulario del sitio las registra en `/panel/consultas` (estado nueva, contestada o cerrada, y quién la
  atiende), además de abrir WhatsApp.
- **Usuarios:** `/panel/usuarios` (solo titular): alta, tipo, activar o desactivar, nueva clave y actividad reciente.
  Usuarios de ejemplo en la pantalla de ingreso. Es control de interfaz de la demo: con el servidor real, los permisos los
  valida el backend.
- **Barra lateral:** Resumen (indicadores, consultas para atender y actividad), Propiedades, Destacadas (con orden y
  miniaturas), Consultas, Usuarios y Copias y ajustes. En el celular se abre como menú; en la computadora se puede contraer.
- **Propiedades:** orden (más recientes, título, estado), duplicar una propiedad como pausada y enlace «Ver en el sitio».
  El formulario muestra una vista previa de la tarjeta, cuenta caracteres y avisa si se sale con cambios sin guardar.
  Las consultas tienen búsqueda, filtro «asignadas a mí» y notas internas.

## Asistente de redacción con IA

En el formulario de cada propiedad, «Redactar con IA» mira las fotos (hasta 6) y los datos y arma, con un tono a elegir:
título, descripción y características para el sitio, texto de Instagram, de Facebook, de Mercado Libre (título de hasta 60
caracteres, sin datos de contacto), mensaje de WhatsApp y sugerencias para mejorar el aviso. Cada texto se copia con un clic y
el del sitio se aplica al formulario.

- **Servidor:** `tools/ai-proxy` (Node + `@anthropic-ai/sdk`). La clave de Claude vive solo ahí, nunca en el navegador.

  ```bash
  cd tools/ai-proxy && npm install
  ANTHROPIC_API_KEY=sk-ant-... npm start   # escucha en 127.0.0.1:8787
  ```

  Modelo configurable con `ANTHROPIC_MODEL` (por defecto `claude-opus-5-5`; un modelo más chico baja el costo por aviso).
- **Desarrollo:** `ng serve` reenvía `/api/ai` al servidor (ver `proxy.conf.json`).
- **Sin servidor de IA** (por ejemplo en GitHub Pages): el panel arma los textos con una plantilla a partir de los datos
  cargados, sin mirar las fotos, y lo indica.
- **Producción:** el endpoint `POST /api/ai/listing-copy` tiene que vivir detrás del login del backend real, con límite de uso.

## Mejoras del sitio público

- **Buscador:** además de operación y zona, filtro por tipo (casa, lote, campo…) y «Mis favoritas».
- **Favoritas:** corazón en cada tarjeta y en la ficha; se guardan en el navegador de quien visita.
- **Ficha:** compartir por WhatsApp, copiar enlace y formulario «Consultá por esta propiedad», que registra la consulta
  en el panel con la propiedad asociada.
- **SEO:** título, descripción, imagen para compartir y datos estructurados (schema.org) por página, y `robots.txt`.
  Pendiente al publicar en el dominio real: `sitemap.xml` y renderizado previo (prerender) de las fichas.

## Calidad del aviso y estadísticas

- **Calidad del aviso (0 a 100):** puntúa fotos, descripción, precio visible, superficie, dormitorios y baños, características,
  ubicación y frase destacada (`src/app/data/listing-quality.ts`). Se ve en vivo en el formulario, como pastilla en el
  listado y en «Avisos para mejorar» del Resumen, con lo que más falta.
- **Estadísticas** (`/panel/estadisticas`): vistas de la ficha, favoritas, clics a WhatsApp, compartidas y consultas por
  propiedad, con avisos del tipo «mucha vista y ninguna consulta». En la demo se cuentan en el navegador; con el backend
  se registran en la base y suman a todos los visitantes.

## Funciones pensadas para la inmobiliaria

- **Tasación en el día** (`/tasacion`): pedido estructurado (tipo, motivo, dirección, superficie, datos de contacto y
  consentimiento) que llega a `/panel/tasaciones` con estado (nueva, en relevamiento, entregada, cerrada), responsable,
  valor entregado y notas. Marca en rojo lo que pasa de 24 horas sin entregar, la promesa del sitio.
- **Datos de la propiedad:** antigüedad, cocheras, sucursal, ubicación en mapa (exacta o aproximada) y, para campos y lotes,
  hectáreas, aptitud, mejoras y distancia a ruta. El precio sigue siendo texto, pero el buscador filtra por precio máximo y
  moneda a partir de él. Los datos del propietario son internos y no salen en el sitio.
- **Cartel con QR** (`/panel/propiedad/:id/cartel`): cartel A4 «Se vende / Se alquila» con código QR a la ficha. Los
  escaneos se cuentan en las estadísticas.
- **Informe al propietario** (`/panel/propiedad/:id/informe`): vistas, favoritas, consultas, escaneos y calidad del aviso,
  con un espacio de comentarios, listo para imprimir o guardar como PDF.
- **Link en bio** (`/ig`): página móvil para Instagram con accesos directos y las últimas propiedades.
- **Privacidad:** `/privacidad` (borrador para que lo revise la titular) y casilla de consentimiento en los tres formularios
  que piden datos.

## Clientes, gestión legal y mapas

Todo funciona en modo demostración (los datos viven en el navegador) y se carga a través de `CollectionStore`
(`src/app/data/collection-store.ts`): al tener backend solo cambian `load()` y `commit()`.

- **Mapas** (Google Maps si hay clave, OpenStreetMap si no): botón Lista/Mapa en el buscador del sitio, `/panel/mapa` con toda la cartera por
  estado y un mapa para elegir la ubicación al editar una propiedad. Las propiedades sin coordenadas no aparecen en el mapa.
- **Contactos** (`/panel/contactos`): compradores, propietarios e inquilinos con un historial armado a partir de consultas,
  tasaciones, visitas, búsquedas y contratos (se vinculan por teléfono o mail). «Guardar como contacto» desde consultas y tasaciones.
- **Visitas** (`/panel/visitas`): agenda con estado, devolución e interés. Las devoluciones salen en el informe al propietario.
- **Búsquedas guardadas** (`/panel/busquedas`): lo que busca cada comprador, con las propiedades que coinciden y aviso por
  WhatsApp. En el sitio, «Avisame cuando salga algo así» las crea con consentimiento.
- **Contratos** (`/panel/contratos`, solo titular): alquileres y arrendamientos con vencimiento y próximo ajuste, y alertas.
- **Documentos** (`/panel/documentos`): modelos de autorización de venta, reserva, locación y arrendamiento rural con los
  datos de la propiedad y el contacto. Son modelos base que la abogada debe revisar.
- **Expedientes** (`/panel/expedientes`, solo titular): trámites con lista de documentación y vencimientos.
- **Calculadoras** (`/calculadoras`): gastos de una compra y entrada a un alquiler. Los porcentajes son de referencia y se
  pueden cambiar; confirmarlos con escribanía.

Pendiente: backend con base de datos, usuarios reales, y avisos por mail y WhatsApp.

### Google Maps

1. En Google Cloud, crear una clave y habilitar **Maps JavaScript API** y **Maps Embed API**.
2. Restringirla por **referrer HTTP** (el dominio del sitio y `localhost:43127` para desarrollar) y limitarla a esas dos APIs.
3. Pegarla en `src/app/config/maps.config.ts` (`GOOGLE_MAPS_API_KEY`).

Con la clave: mapa de la cartera, mapa del buscador y selector de ubicación usan Google Maps con marcadores avanzados.
Sin clave: se usa OpenStreetMap, y la ficha incrusta la vista pública de Google. Las marcas usan `DEMO_MAP_ID`, que
alcanza para empezar; para un estilo propio hay que crear un Map ID en Google Cloud.

## Mejoras de interfaz

- **Ficha:** migas de pan, galería con tira de miniaturas, etiquetas de operación, tipo y destacada, datos clave con íconos
  (superficie, ambientes, cocheras, antigüedad, hectáreas), características en etiquetas, ubicación y panel de contacto fijo
  en escritorio. En el celular, barra inferior con precio, llamada y WhatsApp.
- **Inicio:** buscador rápido en el encabezado (operación, tipo y zona), franja de datos, servicios con íconos y una banda
  que lleva a la tasación.
- **Panel de contacto de la ficha:** precio, WhatsApp como acción principal, llamar y email en una fila, quién atiende
  (con foto y matrícula) y el formulario plegado, para que el panel entre completo en pantalla.
- **Encabezado:** sin el logo duplicado (la barra ya lo muestra), título más grande y buscador rápido con más contraste.
- **Buscador del listado:** una sola barra con operación, tipo, precio y zona, y debajo Lista/Mapa y «Avisame».

## Panel: buscador, lotes, recordatorios y tarjetas

- **Buscador global** (`Ctrl+K` o `Cmd+K`): propiedades, contactos, consultas, tasaciones, contratos y expedientes (según lo que
  cada usuario puede ver), con atajos a las secciones. Flechas para moverse, Enter para abrir, Esc para cerrar.
- **Menú lateral por secciones plegables:** Inmuebles y Clientes abiertas; Gestión y Sistema cerradas (se abren solas si estás
  dentro). El estado se recuerda.
- **Acciones en lote** en Propiedades: seleccionar varias y cambiar estado, responsable o sucursal, o eliminar (titular).
- **Historial por propiedad:** cada edición registra qué cambió (precio, estado, título…) y se ve al final del formulario.
- **Pedir una visita desde la ficha:** queda «Para confirmar» en `/panel/visitas`, con contador en el menú y en el Resumen.
- **Recordatorios:** en el Resumen, y botón «Recordar» en consultas, tasaciones y contactos.
- **Tarjetas:** una sola receta (`.mer-card`, `.mer-stat`, `.prop-card` en `styles.css`). En el sitio todas las tarjetas de una
  fila miden lo mismo y el pie queda alineado, con el título reservado a dos líneas.

## Pruebas automáticas

```bash
export CHROME_BIN="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"   # en macOS
npx ng test --watch=false --browsers=ChromeHeadless
```

Cubren lo más delicado: permisos por tipo de usuario, el almacén de propiedades (destacadas, lotes, deshacer, historial),
la calidad del aviso, el filtro de precio, las búsquedas guardadas, las calculadoras y fechas de contratos, y los modelos
de documentos. Son 36 pruebas.

## Avisos con «Deshacer»

Eliminar una propiedad o cambiar varias en lote muestra un aviso abajo con «Deshacer» durante 7 segundos
(`ToastService`, `toast-host`). Restaurar respeta los permisos de quien lo hace.

## SEO al publicar

`tools/postbuild.mjs <carpeta> [url]` corre después del build (lo hace el workflow): escribe un `index.html` por ruta conocida
(propiedades, zonas, guías, tasación…) con su título, descripción, imagen y datos estructurados, genera `sitemap.xml`,
agrega `Sitemap:` a `robots.txt` y crea `404.html`. Las rutas nuevas se agregan en ese script.
