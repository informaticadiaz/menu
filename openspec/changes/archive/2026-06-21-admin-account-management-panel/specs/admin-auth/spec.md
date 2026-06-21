## MODIFIED Requirements

### Requirement: Login de administrador
El sistema SHALL permitir a un administrador autenticarse con email y password contra la tabla `admin_users`, emitiendo una cookie httpOnly con un JWT firmado si las credenciales son válidas y el negocio asociado está activo.

#### Scenario: Login exitoso
- **WHEN** un admin envía `POST /api/auth/login` con un email y password que coinciden con un registro de `admin_users` (password verificada contra `password_hash` con bcrypt) y el restaurante asociado tiene estado activo
- **THEN** el sistema responde 200 con `Set-Cookie` de una cookie httpOnly (`SameSite=Lax`) que contiene un JWT con `adminId` y `restaurantId`, válido por 7 días, y el body no incluye el token

#### Scenario: Credenciales inválidas
- **WHEN** un admin envía `POST /api/auth/login` con un email inexistente o un password que no coincide
- **THEN** el sistema responde 401 con un mensaje de error genérico, sin indicar si el email existe o no, y no emite ninguna cookie

#### Scenario: Negocio pausado intenta iniciar sesión
- **WHEN** un admin envía `POST /api/auth/login` con credenciales válidas pero el restaurante asociado está pausado
- **THEN** el sistema responde 403 con un mensaje de cuenta pausada y no emite ninguna cookie

#### Scenario: Campos faltantes
- **WHEN** un admin envía `POST /api/auth/login` sin `email` o sin `password`
- **THEN** el sistema responde 400 indicando los campos requeridos

### Requirement: Protección de rutas de escritura del menú
El sistema SHALL exigir un JWT válido, transportado en una cookie httpOnly, para `POST /api/menu-items`, `PUT /api/menu-items/:id` y `DELETE /api/menu-items/:id`, SHALL rechazar operaciones sobre items que no pertenezcan al `restaurant_id` del token, y SHALL rechazar operaciones de negocios pausados.

#### Scenario: Request sin cookie de sesión
- **WHEN** se envía `POST /api/menu-items`, `PUT /api/menu-items/:id` o `DELETE /api/menu-items/:id` sin la cookie de sesión o con un JWT inválido/expirado dentro de ella
- **THEN** el sistema responde 401 y no realiza ningún cambio

#### Scenario: Token válido pero negocio pausado
- **WHEN** un admin con JWT válido de un negocio pausado intenta crear, editar o borrar un item
- **THEN** el sistema responde 403 y no realiza ningún cambio

#### Scenario: Token válido pero item de otro restaurante
- **WHEN** un admin autenticado con `restaurant_id=1` intenta editar o borrar un `menu_item` cuyo `restaurant_id` es distinto al de su token
- **THEN** el sistema responde 403 y no realiza ningún cambio

#### Scenario: Token válido y item del propio restaurante
- **WHEN** un admin autenticado de un negocio activo envía una operación de escritura sobre un `menu_item` de su propio `restaurant_id`
- **THEN** el sistema realiza la operación normalmente y responde como hoy (200/201)

### Requirement: Listado administrativo del menú
El sistema SHALL exponer `GET /api/admin/menu`, protegido por JWT, que devuelve todos los `menu_items` del `restaurant_id` del admin autenticado, incluyendo los marcados como no disponibles, solo si el negocio está activo.

#### Scenario: Listado autenticado
- **WHEN** un admin autenticado de un negocio activo solicita `GET /api/admin/menu`
- **THEN** el sistema responde 200 con todos los items de su restaurante, disponibles y no disponibles, ordenados por categoría y nombre

#### Scenario: Listado sin autenticación
- **WHEN** se solicita `GET /api/admin/menu` sin token válido
- **THEN** el sistema responde 401

#### Scenario: Listado de negocio pausado
- **WHEN** un admin con JWT válido de un negocio pausado solicita `GET /api/admin/menu`
- **THEN** el sistema responde 403 y no devuelve los items

### Requirement: Consulta de estado de sesión
El sistema SHALL exponer `GET /api/auth/me`, protegido por la misma validación de cookie que las rutas de escritura, para que un cliente sin acceso a la cookie httpOnly pueda saber si hay sesión activa y si el negocio sigue activo.

#### Scenario: Sesión activa
- **WHEN** se envía `GET /api/auth/me` con una cookie de sesión válida de un negocio activo
- **THEN** el sistema responde 200 con `{ restaurantId }` correspondiente al JWT de la cookie

#### Scenario: Sin sesión activa
- **WHEN** se envía `GET /api/auth/me` sin cookie de sesión o con un JWT inválido/expirado
- **THEN** el sistema responde 401

#### Scenario: Sesión de negocio pausado
- **WHEN** se envía `GET /api/auth/me` con una cookie válida de un negocio pausado
- **THEN** el sistema responde 403 indicando que la cuenta está pausada
