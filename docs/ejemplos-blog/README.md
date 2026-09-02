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
