<script lang="ts">
// Modal de búsqueda (Svelte 5, solo runes) sobre el índice de Pagefind.
// Se monta con client:only (sin SSR: el Portal teleporta nodos y rompería la hidratación).
import { Dialog } from 'bits-ui'

interface PagefindResult {
	url: string
	title: string
	excerpt: string
}

interface PagefindApi {
	search: (query: string) => Promise<{
		results: {
			data: () => Promise<{
				url: string
				meta?: { title?: string }
				excerpt: string
			}>
		}[]
	}>
}

let open = $state(false)
let query = $state('')
let results = $state<PagefindResult[]>([])
let searched = $state(false)
let status = $state<'idle' | 'loading' | 'ready' | 'unavailable'>('idle')
let activeIdx = $state(0)
let inputEl = $state<HTMLInputElement | null>(null)

let pagefind: PagefindApi | null = null

const showList = $derived(status === 'ready' && query.trim().length > 0)

async function ensurePagefind(): Promise<PagefindApi | null> {
	if (pagefind) return pagefind
	try {
		// El índice se genera en el build dentro de dist/client/pagefind/.
		// El especificador va en una variable (y el patrón se externaliza en
		// rollupOptions) para que el bundler deje el import() literal.
		const specifier = '/pagefind/pagefind.js'
		// @ts-expect-error - módulo generado por pagefind, no presente en dev
		pagefind = await import(specifier)
		status = 'ready'
		return pagefind
	} catch {
		status = 'unavailable'
		return null
	}
}

async function runSearch(): Promise<void> {
	const pf = pagefind
	if (!pf || query.trim().length === 0) {
		results = []
		searched = false
		return
	}
	const response = await pf.search(query)
	const found = await Promise.all(response.results.slice(0, 8).map((r) => r.data()))
	results = found.map((r) => ({
		url: r.url,
		title: r.meta?.title ?? r.url,
		excerpt: r.excerpt,
	}))
	searched = true
	activeIdx = 0
}

let debounce: ReturnType<typeof setTimeout> | undefined
function onInput(): void {
	clearTimeout(debounce)
	debounce = setTimeout(() => void runSearch(), 120)
}

function onKeydown(event: KeyboardEvent): void {
	if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
		event.preventDefault()
		open = !open
	}
}

function onDocumentClick(event: MouseEvent): void {
	if (event.target instanceof Element && event.target.closest('[data-search-open]')) {
		event.preventDefault()
		open = true
	}
}

$effect(() => {
	// Señal para el fallback inline del header: la isla cargó, el modal funciona.
	// Si un bloqueador impide cargar este chunk, la señal nunca se marca y el
	// botón [data-search-open] abre una búsqueda externa en su lugar.
	document.documentElement.dataset.searchReady = 'true'
})

$effect(() => {
	if (!open) {
		query = ''
		results = []
		searched = false
		activeIdx = 0
		return
	}
	if (status === 'idle') {
		status = 'loading'
		void ensurePagefind()
	}
	// Al abrir, enfoca el campo de búsqueda
	queueMicrotask(() => inputEl?.focus())
})

function onResultsKeydown(event: KeyboardEvent): void {
	if (!showList) return
	if (event.key === 'ArrowDown') {
		event.preventDefault()
		activeIdx = (activeIdx + 1) % results.length
	} else if (event.key === 'ArrowUp') {
		event.preventDefault()
		activeIdx = (activeIdx - 1 + results.length) % results.length
	} else if (event.key === 'Enter' && results[activeIdx]) {
		event.preventDefault()
		window.location.assign(results[activeIdx].url)
		open = false
	}
}
</script>

<svelte:window onkeydown={onKeydown} />
<svelte:document onclick={onDocumentClick} />

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-50 bg-ink/40" />
		<Dialog.Content
			class="fixed top-24 left-1/2 z-50 w-[min(92vw,38rem)] -translate-x-1/2 rounded-lg border border-hairline bg-canvas p-0 shadow-lg outline-none"
			onkeydown={onResultsKeydown}
		>
			<Dialog.Title class="sr-only">Buscar</Dialog.Title>
			<Dialog.Description class="sr-only">Busca en las notas del blog</Dialog.Description>

			<div class="flex items-center gap-3 border-b border-hairline px-4">
				<svg class="size-4 shrink-0 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<circle cx="11" cy="11" r="7"></circle>
					<path d="m20 20-3.5-3.5"></path>
				</svg>
				<input
					bind:this={inputEl}
					bind:value={query}
					oninput={onInput}
					type="search"
					placeholder="Buscar notas…"
					aria-label="Buscar notas"
					class="h-12 w-full bg-transparent text-body outline-none placeholder:text-muted-soft"
				/>
				<Dialog.Close
					class="rounded-md border border-hairline px-2 py-1 text-xs text-muted transition-colors hover:text-ink"
				>
					Esc
				</Dialog.Close>
			</div>

			<div class="max-h-80 overflow-y-auto p-2" role="listbox" aria-label="Resultados">
				{#if status === 'loading'}
					<p class="px-3 py-6 text-sm text-muted">Cargando búsqueda…</p>
				{:else if status === 'unavailable'}
					<p class="px-3 py-6 text-sm text-muted">
						La búsqueda se genera al construir el sitio (<code class="font-mono text-xs">bun run build</code>). En
						desarrollo sin índice no está disponible.
					</p>
				{:else if showList && results.length > 0}
					{#each results as result, i (result.url)}
						<a
							href={result.url}
							class:list={[
								'block rounded-md px-3 py-2.5 transition-colors',
								i === activeIdx ? 'bg-surface-card' : 'hover:bg-surface-soft',
							]}
							onclick={() => (open = false)}
						>
							<span class="block text-sm font-medium text-ink">{result.title}</span>
							<!-- excerpt lo genera Pagefind desde el índice local -->
							<span class="mt-1 block text-xs text-body [&_mark]:bg-surface-strong [&_mark]:text-ink">
								{@html result.excerpt}
							</span>
						</a>
					{/each}
				{:else if showList && searched && results.length === 0}
					<p class="px-3 py-6 text-sm text-muted">Sin resultados para «{query}».</p>
				{:else if showList}
					<p class="px-3 py-6 text-sm text-muted">Buscando…</p>
				{:else}
					<p class="px-3 py-6 text-sm text-muted">Escribe para buscar en el blog.</p>
				{/if}
			</div>

			<div class="flex items-center gap-4 border-t border-hairline px-4 py-2 text-xs text-muted-soft">
				<span>↑↓ navegar</span>
				<span>Enter abrir</span>
				<span>Esc cerrar</span>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
