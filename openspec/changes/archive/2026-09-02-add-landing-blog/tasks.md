# Tasks: add-landing-blog

## 1. Tooling y OpenSpec

- [x] 1.1 Migrar `mise.toml` a bun + node 22, reescribir `package.json` (scripts bun, sin devEngines pnpm) y eliminar `.npmrc` — verificar `bun install` resuelve y `mise current` muestra bun
- [x] 1.2 Validar change con `bunx @fission-ai/openspec validate add-landing-blog` — salida "is valid"

## 2. Config base

- [x] 2.1 Instalar dependencias (astro, @astrojs/cloudflare, @astrojs/mdx, @astrojs/svelte, svelte, tailwindcss, @tailwindcss/vite, @tailwindcss/typography, @astrojs/rss, bits-ui, satori, @resvg/resvg-js; dev: wrangler, pagefind, @biomejs/biome, @astrojs/check, typescript) — `bun install` sin errores y `bun.lock` generado
- [x] 2.2 Crear `astro.config.mjs` (site johan.cl, output server, adapter cloudflare con prerenderEnvironment node, mdx, svelte, tailwind vite, session false) — `bun --bun astro sync` pasa
- [x] 2.3 Crear `wrangler.jsonc` (main entrypoints/server, nodejs_compat, KV VIEWS, assets ./dist/client + ASSETS), `tsconfig.json` (strict), `biome.json`, `src/env.d.ts` — archivos presentes y `wrangler types` genera tipos de VIEWS
- [x] 2.4 Descargar y vender fuentes TTF OFL en `src/assets/fonts/` (Cormorant Garamond 500/600, Inter 400/500, JetBrains Mono 400) — archivos TTF presentes y con licencia OFL documentada

## 3. Design system

- [x] 3.1 Escribir `src/styles/global.css`: `@theme` con paleta completa (canvas, surfaces, hairline, ink/muted, primary fern #4F7D5C + active, acentos, semánticos), espaciado, radios, `@font-face` locales, `@custom-variant dark`, `@plugin "@tailwindcss/typography"` — build CSS emite las utilidades
- [x] 3.2 Verificar contraste AA de pares principales en ambos temas (canvas/ink, primary/on-primary, dark surfaces) — tabla de resultados en el PR/commit

## 4. Shell y layouts

- [x] 4.1 `BaseHead.astro` (meta, canonical, OG/twitter, favicon, JSON-LD base) — página renderiza head completo con site absoluta
- [x] 4.2 `BaseLayout.astro` con `<ClientRouter />` + script inline anti-FOUC (localStorage/prefers-color-scheme → data-theme, astro:after-swap) — primer paint sin FOUC y tema sobrevive navegación
- [x] 4.3 `Header.astro` (wordmark "Johan", nav / ↔ /blog, toggle tema inline, botón búsqueda) y `Footer.astro` dark con placeholders — sin links a terceros
- [x] 4.4 `LandingLayout.astro` (ancho completo) y `FormattedDate.astro` — fechas localizadas es-CL

## 5. Landing wireframe

- [x] 5.1 `src/data/site.ts` tipado con defaults vacíos (solo name Johan) — compila con tipos exportados
- [x] 5.2 Componentes `landing/`: `Hero.astro`, `FeaturesGrid.astro`, `FeaturedProjects.astro`, `LatestPosts.astro` con estados wireframe (hairline punteado, bloques neutros) y población automática al llenar site.ts — `/` renderiza 100% wireframe salvo nombre
- [x] 5.3 `src/pages/index.astro` (secciones + métricas + CTA band verde wireframe) — HTML prerenderizado sin bundles de framework

## 6. Blog

- [x] 6.1 `src/content.config.ts` con schema Zod exacto — `astro sync` genera tipos y una entrada inválida falla el build
- [x] 6.2 3 posts ejemplo (md/mdx: tech, teología, mixto) con frontmatter completo y heroImage en uno — visibles en /blog
- [x] 6.3 `BlogPostLayout.astro` (prose tipográfica, fecha, tiempo de lectura, tags) — cálculo de lectura correcto
- [x] 6.4 `src/pages/blog/index.astro` (listado por fecha, tags, acceso a búsqueda, prerender) — orden descendente verificado
- [x] 6.5 `src/pages/blog/[slug].astro` (JSON-LD BlogPosting, PostViews island, OG image, prerender) — JSON-LD válido en HTML
- [x] 6.6 `src/pages/blog/page/[page].astro` (paginación 6/página, prerender) — con posts temporales se generan 2 páginas y fuera de rango da 404
- [x] 6.7 `src/pages/tags/[tag].astro` (prerender por tag, 404 en tag vacía) — filtro verificado
- [x] 6.8 `src/pages/rss.xml.ts`, `src/pages/404.astro` — feed válido y 404 con shell

## 7. Contador de vistas (KV)

- [x] 7.1 `PostViews.astro` server island (server:defer, fallback esquelético, env.VIEWS.get vía cloudflare:workers) — isla resuelve número o 0
- [x] 7.2 `src/pages/api/views/[slug].ts` (SSR, incremento KV con waitUntil) + script inline con guard sessionStorage — segundo refresh no incrementa
- [x] 7.3 Probar con `wrangler dev` (KV local persistente) — contador persiste entre sesiones locales

## 8. Búsqueda

- [x] 8.1 `Search.svelte` (runes only, bits-ui Dialog, lazy import pagefind, Cmd/Ctrl+K, teclado) — isla `client:idle` monta sin errores
- [x] 8.2 Verificar contra índice de build: resultados con extracto, sin resultados, estado dev sin índice — escenarios del spec search

## 9. OG images

- [x] 9.1 `src/pages/og/[...slug].png.ts` (prerender + getStaticPaths, Satori + resvg-js, plantilla marca con TTF vendidos) — N PNG 1200×630 en dist/client/og/
- [x] 9.2 Metatags og:image/twitter:image absolutas por artículo — inspección del head

## 10. QA y cierre

- [x] 10.1 `bun run check` y `bun run lint` en 0 errores — salidas limpias
- [x] 10.2 `bun run build` completo con `dist/client/pagefind/` generado sin warnings — artefactos presentes
- [x] 10.3 Smoke test con `wrangler dev`: landing, blog, artículo, isla de vistas, 404 — comportamiento según specs
- [x] 10.4 Revisión responsive (móvil/desktop) y ritmo visual del design system — capturas revisadas
  - Nota: verificado estructuralmente (grids colapsan 1/2/3 columnas, hero 6/6→1 col, nav sin hamburguesa aún: 3 items caben en móvil); falta aprobación visual humana
- [x] 10.5 `bunx @fission-ai/openspec archive add-landing-blog` — change archivado y specs mergeados
