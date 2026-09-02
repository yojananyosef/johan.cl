// GENERADOR DE BANNERS OPENGRAPH (1200×630) — prerenderizado en build.
// Cada post publicado produce dist/client/og/<slug>.png; además se genera
// el banner por defecto del sitio en /og/johan.png (usado por BaseHead).
export const prerender = true

import { getCollection } from 'astro:content'
import type { GetStaticPathsItem } from 'astro'
import { site } from '../../data/site'
import { renderOgPng } from '../../utils/og'

export async function getStaticPaths() {
	const posts = await getCollection('blog', ({ data }) => !data.draft)

	const siteDefault: GetStaticPathsItem = {
		params: { slug: 'johan' },
		props: {
			title: 'Notas de tecnología y teología',
			tags: [],
		},
	}

	return [
		siteDefault,
		...posts.map((post) => ({
			params: { slug: post.id },
			props: {
				title: post.data.title,
				tags: post.data.tags,
			},
		})),
	]
}

interface Props {
	title: string
	tags: string[]
}

export async function GET({ props }: { props: Props }) {
	const png = await renderOgPng({
		title: props.title,
		name: site.name,
		domain: site.domain,
		tags: props.tags,
	})

	return new Response(new Uint8Array(png), {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	})
}
