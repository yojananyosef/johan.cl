---
title: 'Ejemplo: este blog corre en Astro 7 sobre Cloudflare Workers'
description: 'Post de ejemplo (puedes borrarlo): modo server con prerender por página, Server Islands para las vistas y búsqueda local con Pagefind.'
pubDate: 2026-09-01
tags: ['tecnología', 'astro', 'cloudflare']
---

Este es un **post de ejemplo** para verificar el layout, el tiempo de lectura, las tags y la búsqueda. Bórralo cuando publiques el primero.

## ¿Por qué este stack?

La idea central del sitio es **cero JavaScript por defecto**: cada página se prerenderiza a HTML plano en el build y el Worker solo atiende lo dinámico (el contador de lecturas y el endpoint de vistas).

- **Astro 7** en modo `server` con el adaptador de Cloudflare.
- **Prerender por página**: la landing, el blog y los artículos existen como archivos estáticos.
- **Server Islands**: el contador de lecturas se resuelve en el Worker tras cargar la página.
- **Pagefind**: el índice de búsqueda se genera sobre `dist/client` al final del build.

## El pipeline del build

```bash
bun --bun astro build && bun x pagefind --site dist/client
```

Pagefind rastrea el HTML generado y escribe fragmentos binarios en `dist/client/pagefind/`. El buscador del sitio (atalho `Cmd/Ctrl+K`) importa ese runtime perezosamente solo cuando abres el modal.

## Qué hay en el Worker

El runtime atiende exactamente dos cosas dinámicas:

1. La Server Island del contador de lecturas, que lee el binding KV `VIEWS`.
2. El endpoint `POST /api/views/[slug]`, que incrementa la clave `views:<slug>` con un guard de sesión en el navegador.

Todo lo demás es CDN puro. Si algo de esto te sirve, bórralo o edítalo: el sitio completo vive en este repo.
