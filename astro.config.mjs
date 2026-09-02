// @ts-check

import cloudflare from '@astrojs/cloudflare'
import mdx from '@astrojs/mdx'
import svelte from '@astrojs/svelte'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

export default defineConfig({
	site: 'https://johan.cl',
	output: 'server',
	adapter: cloudflare({
		// resvg-js (nativo) corre en Node durante el prerender de las OG images
		prerenderEnvironment: 'node',
		// Procesa imágenes con sharp en el build para rutas prerenderizadas
		imageService: 'compile',
	}),
	// No usamos Sessions: evita provisionar el KV "SESSION" extra
	session: false,
	redirects: {
		// La página 1 de la paginación es /blog
		'/blog/page/1': '/blog',
	},
	integrations: [mdx(), svelte()],
	vite: {
		plugins: [tailwindcss()],
		build: {
			rollupOptions: {
				// El índice de Pagefind existe recién tras el build (dist/client/pagefind):
				// se deja el import() literal para que el navegador lo resuelva en runtime.
				external: [/^\/pagefind\//],
			},
		},
	},
})
