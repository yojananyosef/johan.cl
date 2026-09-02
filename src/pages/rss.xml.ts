import { getCollection } from 'astro:content'
import rss from '@astrojs/rss'
import type { APIContext } from 'astro'

export const prerender = true

export async function GET(context: APIContext) {
	const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
	)

	return rss({
		title: 'johan.cl',
		description: 'Notas de tecnología y teología.',
		site: context.site ?? 'https://johan.cl',
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			link: `/blog/${post.id}/`,
			categories: post.data.tags,
		})),
		customData: '<language>es-cl</language>',
	})
}
