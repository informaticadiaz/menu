## MODIFIED Requirements

### Requirement: Lectura de datos del negocio por el admin
El sistema SHALL permitir que un admin autenticado obtenga los datos actuales de su negocio mediante `GET /api/admin/restaurant`, incluyendo nombre, descripción, logo_url y palette_id.

#### Scenario: Admin obtiene sus datos de negocio
- **WHEN** un admin autenticado envía `GET /api/admin/restaurant`
- **THEN** el sistema responde 200 con `id`, `name`, `description`, `logo_url`, `palette_id`, `slug` y `status` del restaurante asociado a su sesión

#### Scenario: Admin no autenticado intenta leer datos
- **WHEN** se envía `GET /api/admin/restaurant` sin cookie de sesión válida
- **THEN** el sistema responde 401

### Requirement: Actualización de branding del negocio
El sistema SHALL permitir que un admin autenticado actualice el nombre, descripción, logo y paleta de color de su negocio mediante `PUT /api/admin/restaurant`.

#### Scenario: Actualización exitosa con todos los campos
- **WHEN** un admin autenticado envía `PUT /api/admin/restaurant` con `name`, `description`, `logo_url` y `palette_id` válidos
- **THEN** el sistema actualiza el registro del restaurante y responde 200 con los datos actualizados

#### Scenario: Actualización con campos parciales
- **WHEN** un admin autenticado envía `PUT /api/admin/restaurant` con solo algunos campos (e.g., solo `palette_id`)
- **THEN** el sistema actualiza únicamente los campos provistos y deja el resto sin cambios, respondiendo 200

#### Scenario: Actualización sin nombre
- **WHEN** un admin autenticado envía `PUT /api/admin/restaurant` con `name` vacío o ausente
- **THEN** el sistema responde 400 indicando que el nombre es requerido y no modifica el restaurante

#### Scenario: Actualización con palette_id inválido
- **WHEN** un admin autenticado envía `PUT /api/admin/restaurant` con un `palette_id` que no existe en el catálogo de paletas
- **THEN** el sistema responde 400 indicando que la paleta no es válida y no modifica el restaurante

#### Scenario: Admin no autenticado intenta actualizar
- **WHEN** se envía `PUT /api/admin/restaurant` sin cookie de sesión válida
- **THEN** el sistema responde 401 y no modifica ningún restaurante

### Requirement: UI de gestión de branding en el panel admin
El panel admin SHALL incluir una sección de "Datos del negocio" que permita al admin ver y editar el nombre, descripción, logo y paleta de color de su negocio.

#### Scenario: Admin ve sus datos de negocio actuales
- **WHEN** el admin navega a `/admin` con sesión activa
- **THEN** la sección de branding muestra el nombre, descripción, logo y paleta de color actuales del negocio (o valores default si no están configurados)

#### Scenario: Admin sube un logo nuevo
- **WHEN** el admin selecciona una imagen mediante el input de logo y guarda los cambios
- **THEN** la imagen se sube vía `POST /api/upload`, la URL resultante se incluye en `PUT /api/admin/restaurant`, y la previsualización del logo se actualiza en el panel

#### Scenario: Admin selecciona una paleta de color
- **WHEN** el admin elige una paleta de la grilla de opciones disponibles y guarda los cambios
- **THEN** la UI incluye el `palette_id` elegido en `PUT /api/admin/restaurant`, y el panel admin y la previsualización reflejan los colores de la nueva paleta tras guardar

#### Scenario: Admin guarda cambios de branding exitosamente
- **WHEN** el admin edita nombre, descripción o paleta y hace clic en guardar
- **THEN** la UI llama a `PUT /api/admin/restaurant` con los datos del form y muestra confirmación de éxito sin recargar la página

#### Scenario: Error al guardar cambios
- **WHEN** `PUT /api/admin/restaurant` responde con error
- **THEN** la UI muestra el mensaje de error y mantiene el form con los valores ingresados
