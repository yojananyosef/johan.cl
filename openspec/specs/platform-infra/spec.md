# platform-infra Specification

## Purpose
Define la infraestructura del proyecto: toolchain Bun, Astro en modo server con adaptador Cloudflare, configuración de Wrangler con KV, pipeline de build con indexado Pagefind y scripts de calidad.

## Requirements

### Requirement: Gestión con Bun
El proyecto SHALL usar Bun como gestor de paquetes y runtime para todos los scripts (`dev`, `build`, `preview`, `check`, `lint`). El repositorio MUST NOT declarar `pnpm` como gestor en `package.json` ni en `mise.toml`.

#### Scenario: Instalación de dependencias
- **WHEN** se ejecuta `bun install` en la raíz del repositorio
- **THEN** las dependencias se instalan sin errores y se genera `bun.lock`

#### Scenario: Ejecución de scripts
- **WHEN** se ejecutan los scripts `bun run dev`, `bun run build`, `bun run check` o `bun run lint`
- **THEN** todos se ejecutan mediante Bun sin errores de gestor de paquetes

### Requirement: Modo server con prerender por página
Astro SHALL configurarse con `output: "server"` y el adaptador `@astrojs/cloudflare`. Cada página estática del sitio (landing, directorio del blog, artículo, paginación, tags, RSS, 404, OG images) MUST declarar `prerender = true`; solo los endpoints dinámicos (incremento de vistas) corren on-demand en el Worker.

#### Scenario: Build produce estáticos y worker
- **WHEN** se ejecuta `bun run build`
- **THEN** las páginas prerenderizadas se emiten como HTML en `dist/client/` y el código del Worker en `dist/server/`

### Requirement: Configuración de Wrangler con KV
El archivo `wrangler.jsonc` SHALL declarar: entrypoint `@astrojs/cloudflare/entrypoints/server`, flag `nodejs_compat`, binding KV `VIEWS` (auto-provisionable por Wrangler) y assets apuntando a `./dist/client` con binding `ASSETS`.

#### Scenario: Despliegue a Cloudflare
- **WHEN** se ejecuta `wrangler deploy` después del build
- **THEN** el Worker se despliega con el binding `VIEWS` disponible y los assets estáticos servidos desde `dist/client/`

#### Scenario: Tipos de bindings
- **WHEN** se ejecuta `wrangler types`
- **THEN** se generan tipos TypeScript para el binding `VIEWS` y el entorno Worker tipa sin errores

### Requirement: Índice de búsqueda en el pipeline
El script `build` SHALL ejecutar Astro y luego Pagefind sobre `dist/client`, generando el índice en `dist/client/pagefind/`.

#### Scenario: Índice generado tras el build
- **WHEN** `bun run build` termina con éxito
- **THEN** existe `dist/client/pagefind/pagefind.js` y el directorio `dist/client/pagefind/` contiene los fragmentos de índice

### Requirement: Calidad de código con Biome
El proyecto SHALL incluir Biome configurado para verificar `src/` (incluyendo archivos `.astro` y `.svelte`) y `astro check` para tipos.

#### Scenario: Lint y tipos limpios
- **WHEN** se ejecutan `bun run lint` y `bun run check`
- **THEN** ambos terminan con código de salida 0
