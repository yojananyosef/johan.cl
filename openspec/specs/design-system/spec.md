# design-system Specification

## Purpose
Define el lenguaje visual del sitio: paleta crema editorial estilo Anthropic con primario verde fern, tipografía serif display + sans humanista, escala de espaciado/radios, y tema claro/oscuro persistente sin FOUC.

## Requirements

### Requirement: Paleta de tokens
Los estilos SHALL definir todos los colores como tokens (variables CSS en `@theme` de Tailwind v4), sin hexágonos inline en los componentes. La paleta MUST incluir: canvas crema `#faf9f5`, tarjetas `#efe9de`, superficie oscura `#181715` (+ variantes), hairline `#e6dfd8`, escala de texto cálido (ink `#141413` … muted-soft `#8e8b82`), primario verde fern `#4F7D5C` (active `#3F6449`), acentos teal/ámbar y semánticos success/warning/error. El primario verde SHALL usarse solo en CTAs primarios y bandas callout full-bleed.

#### Scenario: Cambio del color primario
- **WHEN** se edita el token del primario en `global.css`
- **THEN** todos los botones, enlaces de énfasis y bandas callout del sitio adoptan el nuevo color sin editar componentes

### Requirement: Tipografía editorial
El display SHALL usar una serif (Cormorant Garamond) en peso 400–500 con letter-spacing negativo para todos los headings; el cuerpo SHALL usar Inter; el código SHALL usar JetBrains Mono. Las fuentes MUST vendirse localmente (TTF en el repo, OFL) sin dependencia de CDNs externos. Los headings serif MUST NOT usar peso bold.

#### Scenario: Headings renderizan en serif con tracking negativo
- **WHEN** se inspecciona cualquier `h1`–`h3` renderizado
- **THEN** la fuente usada es la serif vendida, peso ≤ 500 y letter-spacing negativo acorde a la escala display

#### Scenario: Sitio funciona offline
- **WHEN** se bloquean todas las peticiones a dominios externos de fuentes
- **THEN** el sitio renderiza con las fuentes vendidas sin FOUT ni fallback genérico

### Requirement: Escala de espaciado y radios
El sistema SHALL exponer tokens de espaciado (base 4px; section 96px; padding interno de tarjetas 32px) y radios jerárquicos (botones/inputs 8px, tarjetas 12px, contenedores hero 16px, badges pill). El ancho máximo de contenido SHALL ser 1200px centrado.

#### Scenario: Ritmo de secciones consistente
- **WHEN** se mide el padding vertical entre bandas principales de cualquier página
- **THEN** corresponde al token section (96px) en desktop, con colapso proporcional en móvil

### Requirement: Tema claro/oscuro sin FOUC
El sitio SHALL soportar tema claro (canvas crema) y oscuro (superficie oscura cálida), persistido en `localStorage`, respetando `prefers-color-scheme` como inicial. La detección/activación MUST ejecutarse con un script inline sin framework en `<head>` que aplique el atributo de tema antes del primer paint. El tema MUST sobrevivir la navegación con `<ClientRouter />`.

#### Scenario: Primera visita respeta el sistema
- **WHEN** un usuario con sistema en oscuro visita cualquier página por primera vez
- **THEN** el primer paint ya es oscuro, sin destello de tema claro

#### Scenario: Toggle persistente
- **WHEN** el usuario activa el toggle de tema y navega a otra página del sitio
- **THEN** la preferencia elegida se mantiene

### Requirement: Contraste accesible
Las combinaciones texto/fondo en ambos temas SHALL cumplir contraste WCAG AA (≥ 4.5:1 en texto de cuerpo).

#### Scenario: Auditoría de contraste
- **WHEN** se evalúan los pares texto/fondo principales de cada tema
- **THEN** el texto de cuerpo y los CTAs cumplen AA
