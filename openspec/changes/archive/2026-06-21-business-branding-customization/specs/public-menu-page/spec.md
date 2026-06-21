## MODIFIED Requirements

### Requirement: Visualización pública del menú por slug
El sistema SHALL mostrar en `/menu/[slug]` el menú del restaurante correspondiente a ese slug, sin requerir autenticación, consumiendo `GET /api/menu/:slug`. El endpoint SHALL incluir `logo_url` y `description` del restaurante en su respuesta.

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

### Requirement: Encabezado de negocio con branding en el menú público
La página pública del menú SHALL mostrar el logo y la descripción del negocio en el encabezado, cuando estén disponibles.

#### Scenario: Negocio con logo configurado
- **WHEN** un usuario navega a `/menu/<slug>` y el restaurante tiene `logo_url` definido
- **THEN** la página muestra el logo del negocio en el encabezado, antes de las categorías de items

#### Scenario: Negocio sin logo
- **WHEN** un usuario navega a `/menu/<slug>` y el restaurante no tiene `logo_url`
- **THEN** la página no muestra ningún espacio vacío ni imagen rota; el encabezado muestra solo el nombre del negocio

#### Scenario: Negocio con descripción configurada
- **WHEN** un usuario navega a `/menu/<slug>` y el restaurante tiene `description` definida
- **THEN** la página muestra la descripción debajo del nombre del negocio en el encabezado

#### Scenario: Negocio sin descripción
- **WHEN** un usuario navega a `/menu/<slug>` y el restaurante no tiene `description`
- **THEN** la página no muestra ningún texto vacío ni placeholder para la descripción
