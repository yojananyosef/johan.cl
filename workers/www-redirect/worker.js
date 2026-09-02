// Worker mínimo: redirige www.johan.cl → https://johan.cl (301) preservando ruta y query.
// Dominio canónico único = SEO limpio (sin contenido duplicado entre hosts).
export default {
	fetch(request) {
		const url = new URL(request.url);
		const target = new URL(request.url);
		target.hostname = 'johan.cl';
		return Response.redirect(target.href, 301);
	},
};
