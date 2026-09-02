/**
 * Render de banners OpenGraph (1200×630) con Satori + resvg-js.
 * Se ejecuta SOLO en build (prerenderEnvironment: 'node'), donde
 * node:fs y @resvg/resvg-js están disponibles.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { Resvg } from '@resvg/resvg-js'
import satori from 'satori'

const FONTS_DIR = path.resolve(process.cwd(), 'src/assets/fonts')

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
			backgroundColor: '#faf9f5',
			padding: '72px',
			fontFamily: 'Inter',
		},
		children: [
			h('div', {
				style: { display: 'flex', alignItems: 'center', gap: '16px' },
				children: [
					h('div', {
						style: {
							width: '44px',
							height: '44px',
							display: 'flex',
							color: '#141413',
						},
						children: h('svg', {
							width: 44,
							height: 44,
							viewBox: '0 0 24 24',
							children: h('g', {
								stroke: '#141413',
								'stroke-width': 2.4,
								'stroke-linecap': 'square',
								fill: 'none',
								children: [
									h('path', { d: 'M12 3v13.2a3.6 3.6 0 0 1-7.2 0v-.7' }),
									h('path', { d: 'M5.4 6.6h13.4' }),
								],
							}),
						}),
					}),
					h('div', {
						style: {
							display: 'flex',
							fontSize: '30px',
							fontWeight: 500,
							color: '#141413',
						},
						children: name,
					}),
				],
			}),
			h('div', {
				style: {
					display: 'flex',
					flexDirection: 'column',
					gap: '28px',
				},
				children: [
					h('div', {
						style: {
							display: 'flex',
							fontFamily: 'Cormorant Garamond',
							fontWeight: 600,
							fontSize: '68px',
							lineHeight: '1.1',
							letterSpacing: '-0.02em',
							color: '#141413',
							maxWidth: '980px',
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
												border: '1px solid #e6dfd8',
												fontSize: '22px',
												fontWeight: 400,
												color: '#3d3d3a',
											},
											children: tag,
										})
									),
								}),
							]
						: []),
				],
			}),
			h('div', {
				style: {
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					borderTop: '1px solid #e6dfd8',
					paddingTop: '28px',
				},
				children: [
					h('div', {
						style: {
							width: '72px',
							height: '8px',
							borderRadius: '9999px',
							backgroundColor: '#4f7d5c',
							display: 'flex',
						},
					}),
					h('div', {
						style: { display: 'flex', fontSize: '24px', color: '#6c6a64' },
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
