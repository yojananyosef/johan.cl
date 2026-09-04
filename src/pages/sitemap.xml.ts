// SITEMAP prerenderizado: home, blog, posts, tags y paginación del blog.
export const prerender = true

import { getCollection } from 'astro:content'
import { collectTags } from '../utils/tags'

const SITE = 'https://johan.cl'
const PAGE_SIZE = 6 // debe coincidir con el slice de src/pages/blog/index.astro

interface SitemapUrl {
	loc: string
	lastmod?: string
	changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
	priority?: string
}

function day(date: Date): string {
	return date.toISOString().split('T')[0]
}

export async function GET() {
	const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
	)
	const tags = collectTags(posts)
	const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE))

	const urls: SitemapUrl[] = [
		{ loc: `${SITE}/`, changefreq: 'weekly', priority: '1.0' },
		{ loc: `${SITE}/blog/`, changefreq: 'weekly', priority: '0.8' },
		...posts.map((post) => ({
			loc: `${SITE}/blog/${post.id}/`,
			lastmod: day(post.data.updatedDate ?? post.data.pubDate),
			changefreq: 'yearly' as const,
			priority: '0.7',
		})),
		...tags.map(({ slug }) => ({
			loc: `${SITE}/tags/${slug}/`,
			changefreq: 'monthly' as const,
			priority: '0.5',
		})),
	]
	// /blog/page/1 redirige a /blog: solo se listan las páginas 2..N.
	for (let page = 2; page <= totalPages; page++) {
		urls.push({ loc: `${SITE}/blog/page/${page}/`, changefreq: 'monthly', priority: '0.5' })
	}

	const body = urls
		.map(
			(u) =>
				`  <url>\n    <loc>${u.loc}</loc>` +
				(u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : '') +
				(u.changefreq ? `\n    <changefreq>${u.changefreq}</changefreq>` : '') +
				(u.priority ? `\n    <priority>${u.priority}</priority>` : '') +
				`\n  </url>`
		)
		.join('\n')

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
		{ headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
	)
}
