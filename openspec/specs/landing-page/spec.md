# landing-page Specification

## Purpose
Landing personal en `/` como wireframe esquelético minimalista: muestra la estructura completa de secciones con placeholders, sin contenido real más allá del nombre, lista para poblar editando un único archivo de datos.

## Requirements

### Requirement: Shell con navegación desacoplada
El shell (Header/Footer) SHALL estar presente en todas las páginas. El Header MUST mostrar solo el nombre "Johan" como wordmark, navegación mínima entre `/` y `/blog`, el toggle de tema y el acceso a búsqueda. El Footer SHALL ser la banda oscura del sistema con el nombre y espacios de enlaces placeholder.

#### Scenario: Navegación entre dominios de la marca
- **WHEN** el usuario navega desde `/` a `/blog` y viceversa
- **THEN** el shell se mantiene consistente y la navegación ocurre con transiciones fluidas de `<ClientRouter />`

#### Scenario: Sin referencias externas en el shell
- **WHEN** se inspecciona Header y Footer
- **THEN** no aparecen links a proyectos, redes sociales ni terceros: solo el nombre y los placeholders definidos en `site.ts`

### Requirement: Secciones wireframe de la landing
La landing SHALL componerse de las secciones Hero, FeaturesGrid, FeaturedProjects, LatestPosts, métricas y CTA, cada una renderizando placeholders estructurales (cajas con borde hairline punteado, bloques neutros y etiquetas mudas) mientras no existan datos reales. Ninguna sección MUST renderizar contenido real distinto del nombre.

#### Scenario: Landing sin contenido
- **WHEN** se carga `/` con el archivo de datos sin completar
- **THEN** todas las secciones muestran esqueletos de wireframe, sin textos promocionales ni referencias a proyectos o terceros

#### Scenario: Hero solo con nombre
- **WHEN** se carga `/`
- **THEN** el Hero muestra el nombre "Johan", un titular wireframe, botones fantasma (primario verde y secundario hairline) y la tarjeta de ilustración vacía

### Requirement: Único punto de edición de datos
Todo el contenido editable de la landing SHALL vivir en `src/data/site.ts` (nombre, titular, enlaces, proyectos, métricas). Al poblar los campos, las secciones correspondientes MUST renderizar contenido real sin cambios de código.

#### Scenario: Poblar un proyecto
- **WHEN** se agrega una entrada al arreglo de proyectos en `site.ts`
- **THEN** el grid de proyectos muestra la tarjeta con nombre, descripción y enlace reemplazando el tile wireframe

### Requirement: Últimos posts automáticos
La sección LatestPosts SHALL consultar la colección del blog y renderizar los 3 posts más recientes publicados; si no hay suficientes, MUST completar el grid con tiles wireframe.

#### Scenario: Posts disponibles
- **WHEN** existen 3 o más posts publicados (no draft)
- **THEN** la sección muestra los 3 más recientes con título, fecha, descripción y enlace

#### Scenario: Posts insuficientes
- **WHEN** existen menos de 3 posts publicados
- **THEN** la sección muestra los disponibles y completa el resto con tiles wireframe

### Requirement: Cero JavaScript en la landing
La landing SHALL compilar a HTML plano sin islas `client:*`; el único JavaScript permitido es el script inline de tema en `<head>` y el script de atajo del modal de búsqueda.

#### Scenario: Verificación de JS
- **WHEN** se revisa el HTML prerenderizado de `/`
- **THEN** no existe bundle de framework hidratado; solo scripts inline pequeños
