// ENDPOINT SSR: incrementa el contador de lecturas en el KV VIEWS.
// Es la única ruta on-demand del sitio (prerender = false).
// El navegador lo invoca una vez por sesión (guard sessionStorage en el post).

import { env } from 'cloudflare:workers'
import type { APIRoute } from 'astro'

export const prerender = false

const SLUG_RE = /^[a-z0-9-]{1,120}$/

export const POST: APIRoute = async ({ params, locals }) => {
	const slug = params.slug ?? ''
	if (!SLUG_RE.test(slug)) {
		return new Response('Bad request', { status: 400 })
	}

	const key = `views:${slug}`
	const current = await env.VIEWS.get(key)
	const next = String((Number.parseInt(current ?? '0', 10) || 0) + 1)

	// No bloquea la respuesta: la escritura se resuelve en background
	locals.cfContext?.waitUntil(env.VIEWS.put(key, next))

	return new Response(null, {
		status: 204,
		headers: { 'cache-control': 'no-store' },
	})
}
