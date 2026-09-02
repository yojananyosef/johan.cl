/**
 * Tiempo de lectura estimado a partir del cuerpo markdown del post.
 */
const WORDS_PER_MINUTE = 200

export function readingMinutes(body: string | undefined): number {
	if (!body) return 1
	const words = body.trim().split(/\s+/).filter(Boolean).length
	return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}
