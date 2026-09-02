# Design: add-landing-blog

## Context

Repo vacío (solo `package.json` esqueleto pnpm, `mise.toml` con node+pnpm, `.npmrc`). Stack objetivo validado contra el ecosistema a sep-2026: `astro@7.2` (requiere node ≥ 22.12), `@astrojs/cloudflare@14` (peer `wrangler@4`), `@astrojs/svelte@9` (peer `svelte@^5.43`), Vite 8, Tailwind v4 CSS-first, Biome 2 (soporta `.astro`/`.svelte` embebido), Pagefind, Satori. El adaptador Cloudflare v13+ corre `astro dev` dentro de `workerd` vía `@cloudflare/vite-plugin`; la salida del build es `dist/client/` (estáticos) + `dist/server/` (worker), lo que mantiene válido `pagefind --site dist/client`. Los bindings se acceden con `import { env } from 'cloudflare:workers'` (`Astro.locals.runtime` fue eliminado en Astro 6). Server Islands están estables (sin flag).

Contenido: la landing es wireframe (solo el nombre "Johan"); el blog arranca con 3 posts ejemplo etiquetados como tales. Datos reales disponibles (bio, proyectos Aletheia/Teolingo/Next Bible, contacto) quedan documentados en `src/data/site.ts` como comentarios guía, no renderizados.

## Goals / Non-Goals

**Goals:**
- Build reproducible con Bun y despliegue directo a Cloudflare Workers con KV `VIEWS`.
- HTML estático por defecto (prerender), JS solo en: script de tema (inline), isla de búsqueda (`client:idle`), Server Island de vistas (server-side), script de incremento (inline).
- Design system tokenizado 1:1 con la referencia Anthropic, primario verde fern `#4F7D5C`.
- Fuentes vendidas TTF (OFL) reutilizables por Satori en el build.
- Calidad: `astro check` + Biome en 0 errores.

**Non-Goals:**
- No se implementan comentarios, newsletter, analytics de terceros ni i18n.
- No se crean los subdominios de proyectos (solo se listan cuando el usuario pueble `site.ts`; los dominios `*.johan.cl` son Workers independientes).
- No se renderiza contenido real de Johan en la landing (wireframe).
- Sin Cloudflare Pages (eliminado por el adapter v13+): solo Workers.

## Decisions

### D1 — `output: 'server'` + `prerender = true` por página (spec del usuario)
Astro 7 no tiene "prerender por defecto" en modo server: cada página estática declara `export const prerender = true`. El único SSR on-demand es `api/views/[slug]`. Alternativa (`output: 'static'` + `prerender = false` puntual) es más segura contra olvidos, pero se respeta el constraint explícito del usuario; el riesgo se mitiga con una nota en cada página.

### D2 — OG images prerenderizadas en build
`@resvg/resvg-js` es binario nativo (napi) y **no corre en workerd**. Se prerenderiza el endpoint (`prerender = true` + `getStaticPaths`): Satori+resvg corren en Node durante el build y los PNG quedan estáticos en CDN. Alternativa descartada: on-demand con `@resvg/resvg-wasm` (costo de CPU por request y swap de dependencia). Se configura `prerenderEnvironment: 'node'` porque el prerender por defecto de Astro 6+ corre en workerd y fallaría con resvg-js. La fuente para Satori se importa como binario vía `?inline`-equivalente de Vite/`fs` en Node (build-time).

### D3 — Contador de vistas: isla solo lee, endpoint incrementa
`PostViews.astro` (server island, `server:defer`) hace `env.VIEWS.get('views:<slug>')` y formatea. El incremento ocurre en `src/pages/api/views/[slug].ts` (SSR): `env.VIEWS.put` con lectura previa (KV eventualmente consistente, tolerable). Un script inline hace `fetch` POST con guard `sessionStorage['viewed:<slug>']` — evita inflar el conteo con refreshes y bots (los bots no ejecutan el script). `session: false` en la config de Astro: no usamos Sessions, evita provisionar el KV `SESSION` extra.

### D4 — Search con Svelte 5 runes + bits-ui
`Search.svelte` usa `$state`/`$derived`/`$props`, montada `client:idle` desde el Header. Diálogo accesible con `bits-ui` (Dialog) — alternativas descartadas: shadcn-svelte (requiere andamiaje completo de `$lib`/utils para un solo componente) y `<dialog>` nativo (menos control del focus trap). Pagefind se importa perezosamente al abrir; en dev sin índice se muestra estado informativo (spec search). El atajo `Cmd/Ctrl+K` vive en un listener de la propia isla.

### D5 — Tema sin FOUC y persistente
Script inline mínimo en `<head>` de `BaseLayout` (antes de cualquier render): lee `localStorage['theme']` o `prefers-color-scheme`, setea `data-theme` en `<html>`. El toggle (botón sin framework, evento `click` inline) actualiza el atributo y persiste. Tailwind v4: `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *))`. Con `<ClientRouter />` el script se re-ejecuta por `astro:after-swap` (patrón documentado de Astro).

### D6 — Tokens del design system en `@theme`
`global.css` define la paleta completa como variables CSS (`--color-canvas`, `--color-primary`, …) en `:root`, sobreescritas en `[data-theme=dark]`. Tailwind v4 expone utilidades (`bg-canvas`, `text-ink`, `border-hairline`, `bg-primary`…). Tipos: `--font-display` (Cormorant Garamond), `--font-sans` (Inter), `--font-mono` (JetBrains Mono) con `@font-face` apuntando a los TTF vendidos en `src/assets/fonts/`. Display sizes con `letter-spacing` negativo y peso ≤ 500. Satori consume los mismos TTF.

### D7 — Datos de la landing centralizados
`src/data/site.ts` exporta un objeto tipado (`name`, `headline`, `role`, `links`, `projects`, `metrics`, `cta`). Default: solo `name: 'Johan'` + arreglos vacíos. Los componentes landing renderizan wireframe (cajas hairline punteadas, bloques neutros, `aria-hidden`) cuando el campo está vacío. `LatestPosts` consulta la colección real y completa con tiles wireframe si faltan.

### D8 — Tipado de bindings
`wrangler types` genera `worker-configuration.d.ts` desde `wrangler.jsonc` (script `types` en package.json, encadenado antes de `check`). Código Worker usa `import { env } from 'cloudflare:workers'` con `Env` tipado.

### D9 — Contenido semilla
3 posts ejemplo (`draft: false`) claramente marcados como ejemplo en el título/frontmatter: 1 técnico (Astro+Cloudflare), 1 teológico, 1 mixto — suficientes para paginación (6/página requiere >6; para validar paginación se verifican 2 páginas con 7+ posts… se acepta validar con 3 posts y cubrir el caso multi-página en revisión manual con posts temporales, ver Riesgos).

## Risks / Trade-offs

- [Bun + plugin workerd en dev puede fallar (WebSocket incompleto en Bun, issue conocido)] → Si `bun --bun astro dev` falla, fallback documentado: `astro dev` (node). Build y producción no se afectan.
- [Olvidar `prerender = true` en una página nueva la hace SSR] → Nota de patrón en `AGENTS.md` del repo + revisión del manifest en build.
- [KV eventualmente consistente: conteo puede rezagarse ~60s] → Aceptable (spec post-views); el guard de sesión evita dobles conteos locales.
- [resvg-js requiere `prerenderEnvironment: 'node'`; cualquier página prerenderizada pierde paridad exacta con workerd] → Solo se usa en build; el código de runtime del Worker no depende de Node puro.
- [Pagefind indexa solo HTML prerenderizado] → Todos los posts son prerenderizados; endpoints SSR no se indexan (deseado).
- [Validar paginación con 3 posts no ejercita `/blog/page/2`] → Durante QA se agregan posts temporales para verificar 2 páginas y se eliminan.
- [Cormorant Garamond es más "alta" que Copernicus: los tamaños display pueden requerir ajuste fino de line-height] → Tokens tipográficos propios; ajuste visual en QA.

## Migration Plan

Proyecto nuevo: no hay migración de código. Despliegue: `bun run build` → `bunx wrangler deploy` (KV auto-provisionado en el primer deploy). Rollback: `wrangler rollback` del Worker. El dominio `johan.cl` se conecta en el dashboard de Cloudflare (custom domain del Worker) — fuera de este change.

## Open Questions

Ninguna abierta que bloquee: las decisiones de marca (verde fern, fuentes, posts semilla) fueron confirmadas por el usuario.
