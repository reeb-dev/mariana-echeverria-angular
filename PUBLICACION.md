# Publicación automática en Instagram, Facebook y Mercado Libre

El panel ya tiene la pantalla **Difundir** (menú «⋯» de cada propiedad → «Difundir en redes y Mercado Libre»):
textos por canal, imágenes (publicación e historia), reel en video y seguimiento de dónde se publicó.

Para que el botón **«Publicar ahora»** aparezca y publique de verdad hace falta un **servidor propio**. Esta web es
estática (GitHub Pages) y **no puede guardar tokens** de las plataformas: cualquier clave dentro del código es pública.

## Qué hace el navegador y qué hace el servidor

| Paso | Dónde |
|---|---|
| Armar texto, imagen y reel con las fotos | Navegador (ya hecho) |
| Guardar tokens de Meta y Mercado Libre, renovarlos | **Servidor** |
| Llamar a las APIs de las plataformas | **Servidor** |
| Guardar dónde quedó publicado cada aviso | Panel (hoy en el navegador; con el servidor, en la base) |

## Contrato que el panel espera del servidor

Ver `src/app/data/publishing.service.ts`.

```
GET  api/publish/status
     → { "instagram": true, "facebook": true, "mercadolibre": false }   // canales con cuenta conectada

POST api/publish/{instagram|facebook|mercadolibre}      (multipart/form-data)
     data  = JSON: { propertyId, slug, title, text, listingTitle?, photoUrls[] }
     media = archivo (imagen PNG o video MP4/WebM) — solo Instagram y Facebook
     → { "ok": true, "url": "https://…" }  |  { "ok": false, "error": "mensaje para mostrar" }
```

El servidor debe validar que quien llama es un usuario del panel con permiso, y registrar quién publicó qué.

## Lo que pide cada plataforma (verificar contra la documentación vigente)

### Instagram y Facebook (Meta)
- Cuenta de Instagram **profesional** vinculada a una **página de Facebook**.
- Una **app en Meta for Developers** con los permisos de publicación de contenido en Instagram y de gestión de
  publicaciones de la página. Para usarlos con cuentas ajenas, la app pasa por **revisión de Meta**; para la cuenta
  propia del negocio alcanza con modo desarrollo y la cuenta como administradora/tester.
- Instagram publica imágenes y reels **a partir de una dirección pública** del archivo: el servidor tiene que subir el
  video/imagen recibido a un almacenamiento con URL pública (S3, R2, etc.) y pasársela a la API.
- Los tokens de larga duración **vencen** y hay que renovarlos.

### Mercado Libre
- **Aplicación** registrada en el sitio de desarrolladores de Mercado Libre y autorización **OAuth** de la cuenta
  vendedora (el token se renueva con un *refresh token*).
- Publicar un inmueble exige **categoría**, **tipo de publicación** y los **atributos** que pida esa categoría
  (superficie, ambientes, operación, ubicación, etc.), más las fotos por dirección pública. El título tiene tope de
  60 caracteres. Hay que mapear los campos de la propiedad a los atributos de la categoría.
- Los avisos de inmuebles pueden tener costo según el tipo de publicación elegido.

## Próximos pasos sugeridos

1. Definir dónde corre el servidor (por ejemplo, Node/Express o Cloudflare Workers) y el almacenamiento de archivos.
2. Registrar las aplicaciones en Meta y en Mercado Libre y hacer la vinculación OAuth de las cuentas de Mariana.
3. Implementar `GET api/publish/status` y un canal por vez, empezando por **Facebook** (el más simple), luego
   Instagram y por último Mercado Libre (mapeo de atributos).
4. Guardar el resultado (URL y fecha) y mostrarlo en el panel en lugar de la marca manual.
