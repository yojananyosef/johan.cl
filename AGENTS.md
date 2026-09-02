# AGENTS.md — johan.cl

## Gestor y runtime

- **Bun** para todo (`bun install`, `bun run <script>`, `bunx`). Nunca npm/pnpm/yarn.
- Node ≥ 22.12 (requisito de Astro 7); `mise.toml` fija bun + node 22.

## Comandos

```bash
bun run dev      # astro dev (workerd vía plugin de Cloudflare)
bun run build    # astro build + pagefind --site dist/client
bun run check    # wrangler types && astro check
bun run lint     # biome check src/
bun run deploy   # build + wrangler deploy
```

## Convenciones críticas

1. **Toda página estática declara `export const prerender = true`.** El sitio corre `output: "server"`: sin el flag, la página se vuelve SSR en el Worker. Lo único SSR intencional es `src/pages/api/views/[slug].ts`.
2. **Bindings de Cloudflare**: usar `import { env } from 'cloudflare:workers'` (tipos en `worker-configuration.d.ts`, regenerar con `wrangler types`). En módulos cargados por páginas prerenderizadas (p. ej. `PostViews.astro`), el binding se importa **dinámicamente** con degradación — `cloudflare:workers` no existe en el prerender de Node.
3. **Cero JS por defecto**: islas solo para `Search.svelte` (`client:idle`). El tema va con script inline + delegación en `document` (sobrevive `<ClientRouter />`).
4. **Design tokens**: todos los colores/espaciados salen de `src/styles/global.css` (`@theme inline`). El primario es el verde fern — cambiarlo es tocar `:root`/`[data-theme=dark]`. Serif display sin bold, tracking negativo.
5. **Contenido editable**: landing en `src/data/site.ts`; posts en `src/content/blog/` (schema estricto en `src/content.config.ts` — el build falla si el frontmatter es inválido). Ejemplos de posts en `docs/ejemplos-blog/` (fuera de la colección: no se publican). Si mueves/borras posts y el build falla referenciando archivos viejos, limpiar `node_modules/.astro` (ahí vive el data store del content layer).
6. **Biome**: no conectar `noUnusedImports`/`noUnusedVariables` para `.astro`/`.svelte` (falsos positivos; `astro check` sí los valida). `src/styles/global.css` y `src/assets/**` están excluidos (sintaxis Tailwind v4 / assets).
7. **Pagefind**: el índice se genera al final del build en `dist/client/pagefind/`. Solo entra lo que tenga `data-pagefind-body` (los artículos). En dev sin build no hay búsqueda (estado informativo en el modal).
