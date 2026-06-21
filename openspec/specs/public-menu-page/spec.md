# public-menu-page Specification

## Purpose
TBD - created by archiving change public-menu-page. Update Purpose after archive.
## Requirements
### Requirement: Visualización pública del menú por slug
El sistema SHALL mostrar en `/menu/[slug]` el menú del restaurante correspondiente a ese slug, sin requerir autenticación, consumiendo `GET /api/menu/:slug`.

#### Scenario: Slug válido con items
- **WHEN** un usuario navega a `/menu/<slug-existente>`
- **THEN** la página muestra los items del restaurante, agrupados por categoría, cada uno con nombre, descripción y precio

#### Scenario: Slug inexistente
- **WHEN** un usuario navega a `/menu/<slug-inexistente>` y el backend responde 404
- **THEN** la página muestra una pantalla de error clara indicando que el restaurante no fue encontrado, sin exponer detalles técnicos del error

#### Scenario: Backend no disponible
- **WHEN** la petición a `GET /api/menu/:slug` falla por un error de red o del servidor (no un 404 de slug)
- **THEN** la página muestra un mensaje de error genérico distinto al de "restaurante no encontrado", sin crashear

### Requirement: Ocultamiento de items no disponibles
El sistema SHALL excluir de la vista pública cualquier item cuyo campo `available` sea falso.

#### Scenario: Item no disponible
- **WHEN** el menú del restaurante incluye un item con `available = 0`
- **THEN** ese item no aparece en ninguna categoría de la vista pública

#### Scenario: Categoría sin items disponibles
- **WHEN** todos los items de una categoría tienen `available = 0`
- **THEN** esa categoría no se muestra en la vista (no aparece un encabezado de categoría vacío)

### Requirement: Imagen de item con fallback
El sistema SHALL mostrar la imagen del item (`image_url`) cuando exista, y un placeholder visual consistente cuando no exista.

#### Scenario: Item con imagen
- **WHEN** un item tiene `image_url` definido
- **THEN** la vista muestra esa imagen junto al nombre, descripción y precio del item

#### Scenario: Item sin imagen
- **WHEN** un item tiene `image_url` nulo o vacío
- **THEN** la vista muestra el item con un placeholder o layout alternativo, sin un espacio en blanco roto ni un ícono de imagen rota

### Requirement: Diseño mobile-first
El sistema SHALL priorizar la legibilidad y usabilidad de la página en viewports de celular, siendo el caso de uso principal el escaneo de un QR en la mesa.

#### Scenario: Visualización en viewport móvil
- **WHEN** la página se renderiza en un viewport de ancho típico de celular (320–480px)
- **THEN** el contenido (categorías, items, precios) es completamente legible sin scroll horizontal ni texto cortado

#### Scenario: Visualización en viewport de escritorio
- **WHEN** la página se renderiza en un viewport más ancho (desktop/tablet)
- **THEN** el layout se adapta sin verse roto ni desproporcionado, aunque la prioridad de diseño sea mobile

### Requirement: Menú público con jerarquía visual gastronómica
La página pública del menú SHALL mostrar el restaurante, categorías e items con una jerarquía visual clara, legible y mobile-first.

#### Scenario: Cliente escanea QR en celular
- **WHEN** un cliente navega a `/menu/<slug-existente>` desde un viewport móvil
- **THEN** puede identificar restaurante, categorías, nombre de item, descripción y precio sin scroll horizontal ni densidad excesiva

### Requirement: Card de item pulida
Las cards de item SHALL distinguir imagen/placeholder, información principal y precio de forma consistente, evitando placeholders informales o rotos.

#### Scenario: Item sin imagen
- **WHEN** un item disponible no tiene `image_url`
- **THEN** la card muestra un placeholder visual consistente con el diseño, sin emoji informal ni icono roto

#### Scenario: Item con descripción larga
- **WHEN** un item tiene una descripción de varias palabras o frases
- **THEN** la card mantiene lectura clara y el precio sigue siendo fácil de encontrar
