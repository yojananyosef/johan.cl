/**
 * Único punto de edición de contenido del sitio.
 * Los campos vacíos renderizan wireframes en la landing.
 *
 * Guía de edición:
 *  - headline/subheadline: texto del hero (opcional).
 *  - bio: párrafo de identidad del hero (serif, con peso visual). Se lee primero
 *    lo que crees y después lo que haces, ej. 'Hijo de Dios, seguidor de Jesús…'.
 *  - links: redes o contacto, ej. { label: 'GitHub', href: 'https://github.com/...' }.
 *  - features: propuesta de valor, ej. { title: 'Desarrollo web', description: '...' }.
 *  - projects: ej. { name: 'Aletheia', description: 'Plataforma de estudio bíblico libre',
 *      url: 'https://aletheia.johan.cl', repo: 'https://github.com/yojananyosef/aletheia-platform',
 *      status: 'mvp' }.
 *  - metrics: ej. { value: '3', label: 'Proyectos' }.
 *  - cta: banda callout final, ej. { title: '...', description: '...',
 *      button: { label: 'Leer el blog', href: '/blog' } }.
 */
export interface SiteLink {
	label: string
	href: string
}

export interface SiteFeature {
	title: string
	description: string
}

export interface SiteProject {
	name: string
	description: string
	url: string
	repo?: string
	status: 'mvp' | 'live' | 'wip'
}

export interface SiteMetric {
	value: string
	label: string
}

export interface SiteCta {
	title: string
	description?: string
	button: SiteLink
}

export interface SiteAuthor {
	display: string
	first: string
	last: string
}

export interface SiteLicense {
	id: string
	name: string
	url: string
}

export interface SiteData {
	name: string
	author: SiteAuthor
	license: SiteLicense
	domain: string
	description: string
	headline?: string
	subheadline?: string
	bio: string
	links: SiteLink[]
	features: SiteFeature[]
	projects: SiteProject[]
	metrics: SiteMetric[]
	cta?: SiteCta
}

export const site: SiteData = {
	name: 'Johan Gutiérrez',
	author: { display: 'Johan Gutiérrez', first: 'Johan', last: 'Gutiérrez' },
	license: {
		id: 'CC-BY-NC-ND-4.0',
		name: 'CC BY-NC-ND 4.0',
		url: 'https://creativecommons.org/licenses/by-nc-nd/4.0/deed.es',
	},
	domain: 'johan.cl',
	description: 'Sitio personal de Johan — notas de teología y tecnología.',
	bio: 'Hijo de Dios, seguidor de Jesús y adventista. Lo que creo me define antes que lo que hago: estudio Teología y soy Técnico de Nivel Superior en Programación y Análisis de Sistemas.',
	links: [{ label: 'GitHub', href: 'https://github.com/yojananyosef' }],
	features: [],
	projects: [
		{
			name: 'Aletheia Reader',
			description:
				'Lector bíblico accesible con narración en audio, 9 versiones en español, modo sin conexión y accesibilidad WCAG 2.2 AAA.',
			url: 'https://aletheiareader.johan.cl',
			repo: 'https://github.com/yojananyosef/aletheia-reader',
			status: 'live',
		},
	],
	metrics: [],
	cta: {
		title: '¿Estudiamos juntos?',
		button: { label: 'Leer el blog', href: '/blog' },
	},
}
