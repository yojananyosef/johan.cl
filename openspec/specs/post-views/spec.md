# post-views Specification

## Purpose
Contador de lecturas por artículo usando una Server Island que lee el binding KV `VIEWS` de Cloudflare, con incremento vía endpoint SSR protegido contra conteo repetido por sesión.

## Requirements

### Requirement: Lectura como Server Island
Cada artículo SHALL mostrar su contador de lecturas mediante un componente con `server:defer` (Server Island) que lee el valor `views:<slug>` del KV `VIEWS` en el Worker. El HTML prerenderizado MUST incluir un fallback esquelético que se reemplaza cuando la isla resuelve.

#### Scenario: Página prerenderizada con isla dinámica
- **WHEN** se carga un artículo prerenderizado
- **THEN** primero se ve el esqueleto del contador y luego el número real obtenido del KV, sin recargar la página

#### Scenario: Valor ausente en KV
- **WHEN** no existe aún la clave `views:<slug>` en el KV
- **THEN** la isla renderiza `0` (o equivalente localizado) sin error

### Requirement: Incremento vía endpoint
El incremento SHALL realizarse por un endpoint SSR (`prerender = false`) que recibe el slug, incrementa el contador en el KV de forma atómica y responde exitosamente. Un script inline SHALL invocarlo una única vez por sesión del navegador (guard en `sessionStorage`), nunca desde bots que solo renderizan HTML.

#### Scenario: Primera lectura de una sesión
- **WHEN** un visitante abre un artículo por primera vez en su sesión
- **THEN** se emite la petición de incremento y lecturas posteriores del mismo artículo en esa sesión no incrementan

#### Scenario: Recarga del artículo
- **WHEN** el visitante recarga el mismo artículo dentro de la misma sesión
- **THEN** el contador no vuelve a incrementarse

### Requirement: Persistencia en KV con clave por slug
El contador SHALL persistirse en el namespace KV bound como `VIEWS`, con una clave por slug de artículo y tolerancia a consistencia eventual (el valor mostrado puede rezagarse hasta 60s globalmente).

#### Scenario: Persistencia entre sesiones
- **WHEN** un nuevo visitante abre un artículo que ya tiene vistas acumuladas
- **THEN** la isla muestra el total acumulado incluyendo visitas previas
