# Delta: og-images

## Purpose

Generación en build de banners OpenGraph (1200×630) por artículo con Satori + resvg-js, servidos como PNG estáticos y referenciados en las metatags sociales del sitio.

## ADDED Requirements

### Requirement: Generación en build por post
El endpoint `og/[...slug].png` SHALL prerenderizarse en el build (`prerender = true` + `getStaticPaths` sobre los posts publicados), renderizando con Satori (SVG) y convirtiendo a PNG con resvg-js en Node. Cada post publicado MUST tener su PNG en la salida estática.

#### Scenario: PNG por artículo
- **WHEN** el build completa con N posts publicados
- **THEN** existen N archivos `dist/client/og/<slug>.png` de 1200×630 píxeles

#### Scenario: Runtime compatible
- **WHEN** el build prerenderiza el endpoint de OG
- **THEN** la renderización usa entorno Node (`prerenderEnvironment: 'node'`) y no requiere runtime de Worker

### Requirement: Plantilla de marca
El banner SHALL usar la plantilla del design system: fondo crema, tipografía serif display vendida, nombre "Johan", título del artículo acotado y acento del primario verde, con variante acorde al contenido. Si el título excede el espacio, MUST truncarse con elipsis sin desbordar el lienzo.

#### Scenario: Título largo
- **WHEN** un post tiene un título de 75 caracteres (máximo del schema)
- **THEN** el texto se trunca con elipsis y permanece dentro de los márgenes del lienzo

### Requirement: Metatags sociales coherentes
Las páginas de artículo SHALL referenciar su banner generado en `og:image`/`twitter:image` con URL absoluta del sitio, y los posts sin heroImage propia MUST usar el banner generado.

#### Scenario: Compartir en redes
- **WHEN** se inspecciona el `<head>` de un artículo
- **THEN** `og:image` apunta a `https://johan.cl/og/<slug>.png` con dimensiones 1200×630
