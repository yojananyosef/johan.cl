/**
 * Las tags se muestran con su texto original y se URL-slugifican
 * (minúsculas, sin acentos, guiones) para /tags/[tag].
 */
export function tagToSlug(tag: string): string {
	return tag
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '')
}

export interface TagCount {
	tag: string
	slug: string
	count: number
}

export function collectTags(posts: { data: { tags: string[] } }[]): TagCount[] {
	const counts = new Map<string, TagCount>()
	for (const post of posts) {
		for (const tag of post.data.tags) {
			const slug = tagToSlug(tag)
			const found = counts.get(slug)
			if (found) {
				found.count += 1
			} else {
				counts.set(slug, { tag, slug, count: 1 })
			}
		}
	}
	return [...counts.values()].sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
}
