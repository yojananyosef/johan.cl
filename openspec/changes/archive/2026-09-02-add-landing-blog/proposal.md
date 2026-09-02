# Proposal: add-landing-blog

## Why

johan.cl no existe todavía como sitio: el repo está vacío. Se necesita una presencia propia que combine una landing personal minimalista (modo wireframe, para llenar con contenido gradualmente) y un blog técnico/teológico independiente, servido desde Cloudflare Workers con KV, con búsqueda local y cero JavaScript por defecto.

## What Changes

- Se construye el sitio completo desde cero con Astro 7 (`output: "server"`) + adaptador Cloudflare v14, contenido prerenderizado por página (`prerender = true`), Bun como runtime/gestor.
- Landing `/` como **wireframe esquelético**: solo el nombre "Johan"; cada sección (Hero, Features, Projects, LatestPosts, métricas, CTA) es placeholder estructural listo para poblar vía `src/data/site.ts` y la colección de blog.
- Blog `/blog` desacoplado: colección MDX con schema Zod estricto, directorio con buscador, paginación estática, tags, artículo con JSON-LD, RSS, 404.
- Sistema de diseño Anthropic-style con canvas crema, serif editorial (Cormorant Garamond), primario verde fern `#4F7D5C`, footer oscuro, tema claro/oscuro persistente sin FOUC.
- Búsqueda local con Pagefind indexado tras el build (`dist/client/pagefind`), modal accesible en Svelte 5 (runes) activable con `Cmd/Ctrl+K`.
- Contador de lecturas con Server Island (`server:defer`) conectado al binding KV `VIEWS`; incremento vía endpoint SSR con guard por sesión.
- Banners OpenGraph generados en build (Satori + resvg-js, prerender) para cada post.
- Infraestructura: `wrangler.jsonc` (KV auto-provisionado, `nodejs_compat`, assets `./dist/client`), Biome como linter/formatter, scripts bun.

## Capabilities

### New Capabilities
- `platform-infra`: Configuración del proyecto (Bun, Astro server + Cloudflare adapter, wrangler, KV, pipeline build con Pagefind, deploy).
- `design-system`: Tokens de diseño (colores, tipografía, spacing, radii), modo claro/oscuro, fuentes vendidas.
- `landing-page`: Shell general (Header/Footer/BaseHead), landing wireframe en `/` con secciones esqueléticas y punto único de edición de datos.
- `blog`: Colección de contenido, directorio del blog, artículo, paginación, tags, RSS, 404, JSON-LD.
- `search`: Modal de búsqueda Pagefind accesible (Svelte 5, `client:idle`, `Cmd/Ctrl+K`).
- `post-views`: Contador de lecturas con Server Island + KV `VIEWS` + endpoint de incremento.
- `og-images`: Generación en build de banners OpenGraph por post con Satori + resvg-js.

### Modified Capabilities

<!-- Ninguna: proyecto nuevo, no hay specs previas. -->

## Impact

- **Código**: nuevo árbol `src/` completo (components, layouts, pages, styles, data, content); archivos raíz `astro.config.mjs`, `wrangler.jsonc`, `tsconfig.json`, `biome.json`, `package.json`, `mise.toml`.
- **Dependencias**: astro, @astrojs/cloudflare, @astrojs/mdx, @astrojs/svelte, svelte, tailwindcss v4 (+vite/typography), @astrojs/rss, bits-ui, satori, @resvg/resvg-js; dev: wrangler, pagefind, biome, @astrojs/check, typescript.
- **Cloudflare**: Worker `johan-cl` con binding KV `VIEWS` (auto-provisionado al desplegar), assets estáticos `dist/client`, custom domain `johan.cl`.
- **Sin breaking changes** (proyecto nuevo). El `package.json`/`mise.toml` existentes (esqueleto pnpm) se migran a Bun.
