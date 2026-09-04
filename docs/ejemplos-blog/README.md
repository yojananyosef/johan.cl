# Ejemplos de posts (no se publican)

Estos archivos **no pertenecen a la colección del blog**: viven fuera de
`src/content/blog/`, así que el loader `glob()` nunca los carga (no se
renderizan, no entran al RSS, ni al índice de Pagefind, ni generan OG).

Sirven como referencia de los dos formatos soportados:

- `ejemplo-astro-cloudflare.md` — markdown puro con código y listas.
- `ejemplo-nota-teologica.mdx` — MDX con tabla y cita destacada.
- `ejemplo-tecnologia-y-teologia.md` — frontmatter completo: `heroImage`,
  `updatedDate` y varias tags.

## Publicar una nota nueva

1. Crea `src/content/blog/mi-nota.md` (o `.mdx`).
2. Frontmatter mínimo:

   ```yaml
   ---
   title: 'Máximo 75 caracteres'
   description: 'Máximo 160 caracteres.'
   pubDate: 2026-09-02
   tags: ['tecnología'] # opcional
   draft: false # true = no se publica
   ---
   ```

3. `bun run dev` para previsualizar; `bun run build` valida el schema Zod
   (falla si `title`/`description` exceden los límites).

## Notas académicas (orden Chicago/Turabian)

Astro relega las footnotes `[^n]` al final del documento, **después** de la
bibliografía. En posts académicos usa endnotes manuales para mantener el
orden Notas → Bibliografía (ver `inspiracion-y-uso-de-fuentes-en-la-biblia.md`):

- En el cuerpo: `<sup><a href="#n1" id="ref1">1</a></sup>`.
- Al final: `## Notas` con `<div class="endnotes">` + lista ordenada
  `1. <a id="n1"></a>Texto de la nota. [↩](#ref1)`, y después `## Bibliografía`.
  El markdown dentro del `div` sí se convierte a `<ol>/<ul>` en el build
  (verificado en `dist/`); el CSS asume `<li><p>` y pone la sangría en el
  primer párrafo.
- Los índices heredan el estilo editorial (serif + verde fern) desde
  `.prose-post .endnotes` en `src/styles/global.css`.
- Los párrafos del cuerpo llevan sangría de primera línea (Turabian); el de
  apertura y el que sigue a un encabezado van sin sangría.

## Atribución (cómo citar)

Los posts académicos activan el bloque de citación con `showCitation: true`
en el frontmatter. El componente `src/components/Citation.astro` muestra dos
formatos Turabian en español (comillas «»):

- **Nota:** `Nombre Apellido, «Título», johan.cl, fecha, URL`.
- **Bibliografía:** `Apellido, Nombre. «Título». johan.cl, fecha. URL`
  (+ `Actualizado el …` si el post tiene `updatedDate`).

Cada formato trae botón copiar (clipboard + fallback, delegación en
`document` para sobrevivir al `<ClientRouter />`). La autoría sale de
`site.author` en `src/data/site.ts` y la URL canónica es
`https://johan.cl/blog/<slug>`.

Fechas del frontmatter son días calendario: `FormattedDate` y la cita
formatean en `timeZone: 'UTC'` para que el build no muestre el día anterior.
El año del copyright usa `getUTCFullYear()` por la misma razón.

## Licencia del contenido

El **código** es MIT (`package.json`); el **contenido** de los artículos es
CC BY-NC-ND 4.0 (no comercial, sin derivados). La licencia vive en
`site.license` (`src/data/site.ts`) y se declara en: bloque de cita
(`rel="license"`), footer, `customData` del RSS y `license` +
`copyrightHolder` del JSON-LD de cada artículo.

## SEO social y tarjetas de compartir

- Cada post genera su banner OG en `dist/client/og/<slug>.png` (Satori +
  resvg, plantilla en `src/utils/og.ts`): tarjeta oscura con monograma,
  título serif y tags. Si cambias la plantilla, el PNG cambia en el build.
- WhatsApp cachea agresivamente los previews **por URL exacta**: tras
  modificar un banner o los tags, prueba compartir con `?v=N` nuevo
  (ej. `?v=3`) para forzar un scrapeo fresco.
- `public/robots.txt` + `src/pages/sitemap.xml.ts` (home, blog, posts,
  tags, paginación) cubren la indexación base.
