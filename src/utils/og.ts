/**
 * Render de banners OpenGraph (1200×630) con Satori + resvg-js.
 * Se ejecuta SOLO en build (prerenderEnvironment: 'node'), donde
 * node:fs y @resvg/resvg-js están disponibles.
 *
 * Diseño: tarjeta oscura (surface-dark del sistema) con monograma visible,
 * título serif crema y acento verde fern. El fondo oscuro se distingue en
 * miniaturas de WhatsApp/Telegram/X tanto en modo claro como oscuro,
 * donde la tarjeta crema anterior parecía una imagen rota.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { Resvg } from '@resvg/resvg-js'
import satori from 'satori'

const FONTS_DIR = path.resolve(process.cwd(), 'src/assets/fonts')

// Tokens de marca (ref: src/styles/global.css, tema oscuro).
const INK = '#181715'
const CREAM = '#faf9f5'
const BODY_DARK = '#d8d5cd'
const MUTED_DARK = '#a09d96'
const HAIRLINE_DARK = '#3a3733'
const FERN = '#4f7d5c'

interface OgFont {
	name: string
	data: Buffer
	weight: 400 | 500 | 600
	style: 'normal'
}

async function font(file: string, name: string, weight: OgFont['weight']): Promise<OgFont> {
	return {
		name,
		data: await readFile(path.join(FONTS_DIR, file)),
		weight,
		style: 'normal',
	}
}

export async function loadOgFonts(): Promise<OgFont[]> {
	return Promise.all([
		font('cormorant-garamond-600.ttf', 'Cormorant Garamond', 600),
		font('inter-400.ttf', 'Inter', 400),
		font('inter-500.ttf', 'Inter', 500),
	])
}

type SatoriNode = {
	type: string
	props: {
		style?: Record<string, string | number>
		children?: string | SatoriNode | SatoriNode[]
		[key: string]: unknown
	}
}

function h(type: string, props: SatoriNode['props']): SatoriNode {
	return { type, props }
}

/** Monograma J + cruz (brand-mark del sitio) reutilizable a cualquier tamaño. */
function brandMark(size: number, color: string, strokeWidth: number): SatoriNode {
	return h('svg', {
		width: size,
		height: size,
		viewBox: '0 0 24 24',
		children: h('g', {
			stroke: color,
			'stroke-width': strokeWidth,
			'stroke-linecap': 'square',
			fill: 'none',
			children: [
				h('path', { d: 'M12 3v13.2a3.6 3.6 0 0 1-7.2 0v-.7' }),
				h('path', { d: 'M5.4 6.6h13.4' }),
			],
		}),
	})
}

/** Acota el título a ~2 líneas seguras dentro del lienzo. */
function clampTitle(title: string, max = 92): string {
	if (title.length <= max) return title
	return `${title.slice(0, max - 1).trimEnd()}…`
}

export interface OgTemplateInput {
	title: string
	name: string
	domain: string
	tags?: string[]
}

export function ogTemplate({ title, name, domain, tags = [] }: OgTemplateInput): SatoriNode {
	return h('div', {
		style: {
			width: '1200px',
			height: '630px',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'space-between',
			backgroundColor: INK,
			padding: '64px',
			fontFamily: 'Inter',
		},
		children: [
			// Cabecera de marca.
			h('div', {
				style: { display: 'flex', alignItems: 'center', gap: '16px' },
				children: [
					brandMark(44, CREAM, 2.4),
					h('div', {
						style: {
							display: 'flex',
							fontSize: '30px',
							fontWeight: 500,
							color: CREAM,
						},
						children: name,
					}),
				],
			}),
			// Título + monograma grande lateral.
			h('div', {
				style: {
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'center',
					gap: '40px',
				},
				children: [
					h('div', {
						style: {
							display: 'flex',
							flexDirection: 'column',
							gap: '28px',
							maxWidth: '720px',
						},
						children: [
							h('div', {
								style: {
									display: 'flex',
									fontFamily: 'Cormorant Garamond',
									fontWeight: 600,
									fontSize: '76px',
									lineHeight: '1.05',
									letterSpacing: '-0.02em',
									color: CREAM,
								},
								children: clampTitle(title),
							}),
							...(tags.length > 0
								? [
										h('div', {
											style: { display: 'flex', gap: '12px' },
											children: tags.slice(0, 4).map((tag) =>
												h('div', {
													style: {
														display: 'flex',
														padding: '6px 18px',
														borderRadius: '9999px',
														border: `1px solid ${HAIRLINE_DARK}`,
														fontSize: '22px',
														fontWeight: 400,
														color: BODY_DARK,
													},
													children: tag,
												})
											),
										}),
									]
								: []),
						],
					}),
					brandMark(260, CREAM, 1.1),
				],
			}),
			// Pie con acento fern + dominio.
			h('div', {
				style: {
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					borderTop: `1px solid ${HAIRLINE_DARK}`,
					paddingTop: '28px',
				},
				children: [
					h('div', {
						style: {
							width: '72px',
							height: '8px',
							borderRadius: '9999px',
							backgroundColor: FERN,
							display: 'flex',
						},
					}),
					h('div', {
						style: { display: 'flex', fontSize: '24px', color: MUTED_DARK },
						children: domain,
					}),
				],
			}),
		],
	})
}

export async function renderOgPng(input: OgTemplateInput): Promise<Buffer> {
	const fonts = await loadOgFonts()
	const svg = await satori(ogTemplate(input) as never, {
		width: 1200,
		height: 630,
		fonts: fonts as never,
	})
	return new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng()
}
