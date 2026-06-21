## ADDED Requirements

### Requirement: Restablecimiento de contraseña de admin de negocio
El sistema SHALL permitir que un administrador interno autenticado restablezca la contraseña del admin asociado a un negocio existente, almacenando únicamente un nuevo hash bcrypt.

#### Scenario: Restablecimiento exitoso
- **WHEN** un administrador interno autenticado envía `POST /api/system/restaurants/:id/reset-password` con una nueva contraseña para un negocio que tiene admin asociado
- **THEN** el sistema actualiza `admin_users.password_hash`, responde 200 y no devuelve la contraseña ni el hash

#### Scenario: Nueva contraseña requerida
- **WHEN** un administrador interno autenticado envía `POST /api/system/restaurants/:id/reset-password` sin contraseña
- **THEN** el sistema responde 400 y no modifica `admin_users.password_hash`

#### Scenario: Negocio inexistente o sin admin asociado
- **WHEN** un administrador interno autenticado envía `POST /api/system/restaurants/:id/reset-password` para un negocio inexistente o sin admin asociado
- **THEN** el sistema responde 404 y no modifica otros admins

#### Scenario: Acceso sin sesión interna
- **WHEN** se solicita `POST /api/system/restaurants/:id/reset-password` sin una sesión válida de administrador interno
- **THEN** el sistema responde 401 y no modifica `admin_users.password_hash`

### Requirement: Acción visual para restablecer contraseña
El sistema SHALL proveer en la UI de administración interna una acción para restablecer la contraseña del admin de cada negocio listado y mostrar los datos necesarios para compartir el nuevo acceso.

#### Scenario: Administrador interno restablece desde el panel
- **WHEN** un administrador interno autenticado usa la acción de restablecer contraseña en `/system`, ingresa una nueva contraseña y confirma la acción
- **THEN** la UI llama al endpoint interno correspondiente y muestra un modal con URL de login, email del admin y nueva contraseña

#### Scenario: Copia de datos para WhatsApp
- **WHEN** el restablecimiento fue exitoso y el modal está visible
- **THEN** la UI permite copiar un mensaje con URL de login, email del admin y nueva contraseña para enviarlo por WhatsApp

#### Scenario: Cierre del modal
- **WHEN** el administrador interno cierra el modal de datos de acceso
- **THEN** la UI deja de mostrar la nueva contraseña y la elimina del estado visible del panel
