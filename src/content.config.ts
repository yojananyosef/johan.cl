import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const blog = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
	schema: ({ image }) =>
		z.object({
			title: z.string().max(75),
			description: z.string().max(160),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
			tags: z.array(z.string()).default([]),
			draft: z.boolean().default(false),
			// Muestra el bloque "Cómo citar este artículo" (nota + bibliografía
			// Turabian en español, con botón copiar, + línea CC BY-NC-ND).
			showCitation: z.boolean().default(false),
		}),
})

export const collections = { blog }
