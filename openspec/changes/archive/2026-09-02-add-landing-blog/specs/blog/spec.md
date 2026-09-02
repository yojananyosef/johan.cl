# Delta: blog

## Purpose

Blog técnico/teológico en `/blog` totalmente desacoplado de la landing: colección MDX con schema estricto, directorio con buscador, artículos optimizados para lectura, paginación estática, tags, RSS y página 404.

## ADDED Requirements

### Requirement: Colección de contenido validada
La colección `blog` SHALL cargar archivos `**/*.{md,mdx}` desde `src/content/blog` con loader glob y validar cada entrada con schema Zod: `title` (string, máx 75), `description` (string, máx 160), `pubDate` (fecha), `updatedDate` (opcional), `heroImage` (imagen opcional), `tags` (arreglo, default `[]`), `draft` (boolean, default `false`).

#### Scenario: Entrada inválida
- **WHEN** un archivo de la colección omite `title` o excede los límites de longitud
- **THEN** el build falla con error de validación del schema señalando el archivo

#### Scenario: Draft excluido
- **WHEN** una entrada tiene `draft: true`
- **THEN** no se renderiza en listados, tags, RSS, paginación ni busca en Pagefind

### Requirement: Directorio del blog
`/blog` SHALL listar los artículos publicados ordenados por fecha descendente, exponer el acceso al buscador y mostrar las tags disponibles. Debe prerenderizarse.

#### Scenario: Listado por fecha
- **WHEN** se carga `/blog` con varios posts publicados
- **THEN** se listan ordenados del más reciente al más antiguo con título, fecha, descripción y tags

### Requirement: Artículo optimizado para lectura
`/blog/[slug]` SHALL renderizar el artículo con tipografía prose accesible, fecha formateada, tiempo de lectura estimado, tags enlazadas a sus filtros, JSON-LD `BlogPosting` y el contador de vistas como Server Island. Debe prerenderizarse.

#### Scenario: Metadatos de lectura
- **WHEN** se carga un artículo
- **THEN** la página muestra tiempo de lectura calculado desde el contenido y fecha de publicación en formato local

#### Scenario: Datos estructurados
- **WHEN** se inspecciona el HTML del artículo
- **THEN** existe un bloque JSON-LD válido de tipo `BlogPosting` con titular, descripción, fecha y autor

### Requirement: Paginación estática
El listado SHALL paginar de a 6 posts en `/blog/page/[page]`, con `/blog` como página 1, controles anterior/siguiente y prerender de todas las páginas.

#### Scenario: Más de una página
- **WHEN** existen más de 6 posts publicados
- **THEN** `/blog` muestra los 6 más recientes con navegación a `/blog/page/2`, que lista los siguientes

#### Scenario: Paginación fuera de rango
- **WHEN** se solicita una página que no existe
- **THEN** se responde con 404

### Requirement: Filtro por tags
`/tags/[tag]` SHALL listar los posts publicados que contengan la tag, prerenderizado para cada tag existente.

#### Scenario: Posts por tag
- **WHEN** se visita `/tags/tecnologia` y existen posts con esa tag
- **THEN** se listan solo esos posts con su fecha y descripción

#### Scenario: Tag inexistente
- **WHEN** se visita una tag sin posts asociados o inexistente
- **THEN** se responde 404

### Requirement: RSS y 404
El sitio SHALL exponer `/rss.xml` con los posts publicados (título, descripción, fecha, enlace) y una página 404 con el shell del sitio, ambas prerenderizadas.

#### Scenario: Feed válido
- **WHEN** se solicita `/rss.xml`
- **THEN** se responde XML RSS 2.0 válido con una entrada por post publicado

#### Scenario: Ruta desconocida
- **WHEN** se solicita una ruta inexistente
- **THEN** se muestra la página 404 con navegación de vuelta a `/` y `/blog`
