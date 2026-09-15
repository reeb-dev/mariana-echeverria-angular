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
