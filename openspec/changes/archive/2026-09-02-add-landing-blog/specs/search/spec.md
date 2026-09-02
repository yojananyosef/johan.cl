# Delta: search

## Purpose

Búsqueda local full-text con Pagefind expuesta como modal accesible en Svelte 5 (runes), activada por clic o `Cmd/Ctrl+K`, sin JavaScript hasta que la isla se hidrata.

## ADDED Requirements

### Requirement: Modal de búsqueda accesible
El buscador SHALL implementarse como isla Svelte 5 (`Search.svelte`) usando exclusivamente runes (`$state`, `$derived`, `$props`), montada con `client:idle` desde el Header, con rol de diálogo accesible, focus atrapado, cierre con `Escape` y navegación de resultados por teclado (flechas + Enter).

#### Scenario: Apertura por atajo
- **WHEN** el usuario presiona `Cmd+K` (macOS) o `Ctrl+K` (resto) en cualquier página
- **THEN** se abre el modal con el foco en el campo de búsqueda

#### Scenario: Cierre y retorno de foco
- **WHEN** el usuario cierra el modal con `Escape` o el botón de cerrar
- **THEN** el modal se cierra y el foco vuelve al elemento que lo abrió

### Requirement: Consulta sobre el índice Pagefind
La isla SHALL cargar el runtime de Pagefind de forma perezosa (`/pagefind/pagefind.js`) solo al abrir el modal por primera vez, y SHALL consultar el índice generado en el build mostrando resultados con título, extracto y enlace mientras se escribe.

#### Scenario: Resultados mientras se escribe
- **WHEN** el usuario escribe una consulta que coincide con contenido de posts indexados
- **THEN** se listan resultados con extracto resaltado, navegables con teclado y abribles con Enter

#### Scenario: Sin resultados
- **WHEN** la consulta no produce coincidencias
- **THEN** se muestra un mensaje de "sin resultados" y no se rompe el modal

### Requirement: Degradación sin índice
Si el runtime de Pagefind no está disponible (por ejemplo, en desarrollo sin build previo), el modal SHALL mostrar un estado informativo sin errores en consola que rompan la experiencia.

#### Scenario: Desarrollo sin índice
- **WHEN** se abre el buscador en `bun run dev` sin `dist/client/pagefind/`
- **THEN** el modal informa que la búsqueda está disponible tras el build y sigue navegable
