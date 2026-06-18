## ADDED Requirements

### Requirement: Login de administrador
El sistema SHALL permitir a un administrador autenticarse con email y password contra la tabla `admin_users`, devolviendo un JWT firmado si las credenciales son válidas.

#### Scenario: Login exitoso
- **WHEN** un admin envía `POST /api/auth/login` con un email y password que coinciden con un registro de `admin_users` (password verificada contra `password_hash` con bcrypt)
- **THEN** el sistema responde 200 con un JWT que incluye `admin_id` y `restaurant_id`, válido por 7 días

#### Scenario: Credenciales inválidas
- **WHEN** un admin envía `POST /api/auth/login` con un email inexistente o un password que no coincide
- **THEN** el sistema responde 401 con un mensaje de error genérico, sin indicar si el email existe o no

#### Scenario: Campos faltantes
- **WHEN** un admin envía `POST /api/auth/login` sin `email` o sin `password`
- **THEN** el sistema responde 400 indicando los campos requeridos

### Requirement: Protección de rutas de escritura del menú
El sistema SHALL exigir un JWT válido en el header `Authorization: Bearer <token>` para `POST /api/menu-items`, `PUT /api/menu-items/:id` y `DELETE /api/menu-items/:id`, y SHALL rechazar operaciones sobre items que no pertenezcan al `restaurant_id` del token.

#### Scenario: Request sin token
- **WHEN** se envía `POST /api/menu-items`, `PUT /api/menu-items/:id` o `DELETE /api/menu-items/:id` sin header `Authorization` o con un token inválido/expirado
- **THEN** el sistema responde 401 y no realiza ningún cambio

#### Scenario: Token válido pero item de otro restaurante
- **WHEN** un admin autenticado con `restaurant_id=1` intenta editar o borrar un `menu_item` cuyo `restaurant_id` es distinto al de su token
- **THEN** el sistema responde 403 y no realiza ningún cambio

#### Scenario: Token válido y item del propio restaurante
- **WHEN** un admin autenticado envía una operación de escritura sobre un `menu_item` de su propio `restaurant_id`
- **THEN** el sistema realiza la operación normalmente y responde como hoy (200/201)

### Requirement: Listado administrativo del menú
El sistema SHALL exponer `GET /api/admin/menu`, protegido por JWT, que devuelve todos los `menu_items` del `restaurant_id` del admin autenticado, incluyendo los marcados como no disponibles.

#### Scenario: Listado autenticado
- **WHEN** un admin autenticado solicita `GET /api/admin/menu`
- **THEN** el sistema responde 200 con todos los items de su restaurante, disponibles y no disponibles, ordenados por categoría y nombre

#### Scenario: Listado sin autenticación
- **WHEN** se solicita `GET /api/admin/menu` sin token válido
- **THEN** el sistema responde 401
