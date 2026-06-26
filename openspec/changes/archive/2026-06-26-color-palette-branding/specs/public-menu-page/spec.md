## MODIFIED Requirements

### Requirement: Visualización pública del menú por slug
El sistema SHALL mostrar en `/menu/[slug]` el menú del restaurante correspondiente a ese slug, sin requerir autenticación, consumiendo `GET /api/menu/:slug`. El endpoint SHALL incluir `logo_url`, `description` y `palette_id` del restaurante en su respuesta.

#### Scenario: Slug válido con items
- **WHEN** un usuario navega a `/menu/<slug-existente>`
- **THEN** la página muestra los items del restaurante, agrupados por categoría, cada uno con nombre, descripción y precio

#### Scenario: Slug inexistente
- **WHEN** un usuario navega a `/menu/<slug-inexistente>` y el backend responde 404
- **THEN** la página muestra una pantalla de error clara indicando que el restaurante no fue encontrado, sin exponer detalles técnicos del error

#### Scenario: Backend no disponible
- **WHEN** la petición a `GET /api/menu/:slug` falla por un error de red o del servidor (no un 404 de slug)
- **THEN** la página muestra un mensaje de error genérico distinto al de "restaurante no encontrado", sin crashear

## ADDED Requirements

### Requirement: Theming de la paleta de color del negocio
La página pública del menú SHALL aplicar la paleta de color del negocio (`palette_id`) como tema visual del fondo, acentos y botones de la página.

#### Scenario: Negocio con paleta configurada
- **WHEN** un usuario navega a `/menu/<slug>` y el restaurante tiene un `palette_id` válido
- **THEN** la página renderiza fondo, acentos y botones usando los colores de esa paleta

#### Scenario: Negocio sin paleta configurada
- **WHEN** un usuario navega a `/menu/<slug>` y el restaurante no tiene `palette_id` (dato preexistente)
- **THEN** la página renderiza con la paleta default, manteniendo la apariencia naranja/clara actual
