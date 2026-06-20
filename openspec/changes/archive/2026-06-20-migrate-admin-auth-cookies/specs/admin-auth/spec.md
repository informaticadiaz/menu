## MODIFIED Requirements

### Requirement: Login de administrador
El sistema SHALL permitir a un administrador autenticarse con email y password contra la tabla `admin_users`, emitiendo una cookie httpOnly con un JWT firmado si las credenciales son válidas.

#### Scenario: Login exitoso
- **WHEN** un admin envía `POST /api/auth/login` con un email y password que coinciden con un registro de `admin_users` (password verificada contra `password_hash` con bcrypt)
- **THEN** el sistema responde 200 con `Set-Cookie` de una cookie httpOnly (`SameSite=Lax`) que contiene un JWT con `adminId` y `restaurantId`, válido por 7 días, y el body no incluye el token

#### Scenario: Credenciales inválidas
- **WHEN** un admin envía `POST /api/auth/login` con un email inexistente o un password que no coincide
- **THEN** el sistema responde 401 con un mensaje de error genérico, sin indicar si el email existe o no, y no emite ninguna cookie

#### Scenario: Campos faltantes
- **WHEN** un admin envía `POST /api/auth/login` sin `email` o sin `password`
- **THEN** el sistema responde 400 indicando los campos requeridos

### Requirement: Protección de rutas de escritura del menú
El sistema SHALL exigir un JWT válido, transportado en una cookie httpOnly, para `POST /api/menu-items`, `PUT /api/menu-items/:id` y `DELETE /api/menu-items/:id`, y SHALL rechazar operaciones sobre items que no pertenezcan al `restaurant_id` del token.

#### Scenario: Request sin cookie de sesión
- **WHEN** se envía `POST /api/menu-items`, `PUT /api/menu-items/:id` o `DELETE /api/menu-items/:id` sin la cookie de sesión o con un JWT inválido/expirado dentro de ella
- **THEN** el sistema responde 401 y no realiza ningún cambio

#### Scenario: Token válido pero item de otro restaurante
- **WHEN** un admin autenticado con `restaurant_id=1` intenta editar o borrar un `menu_item` cuyo `restaurant_id` es distinto al de su token
- **THEN** el sistema responde 403 y no realiza ningún cambio

#### Scenario: Token válido y item del propio restaurante
- **WHEN** un admin autenticado envía una operación de escritura sobre un `menu_item` de su propio `restaurant_id`
- **THEN** el sistema realiza la operación normalmente y responde como hoy (200/201)

## ADDED Requirements

### Requirement: Logout de administrador
El sistema SHALL exponer `POST /api/auth/logout` que invalida la cookie de sesión del admin autenticado.

#### Scenario: Logout exitoso
- **WHEN** un admin con sesión activa envía `POST /api/auth/logout`
- **THEN** el sistema responde 200 y emite un `Set-Cookie` que borra la cookie de sesión (expira inmediatamente)

#### Scenario: Logout sin sesión activa
- **WHEN** se envía `POST /api/auth/logout` sin cookie de sesión válida
- **THEN** el sistema responde 200 igual (el logout es idempotente; no es un error no tener sesión)

### Requirement: Consulta de estado de sesión
El sistema SHALL exponer `GET /api/auth/me`, protegido por la misma validación de cookie que las rutas de escritura, para que un cliente sin acceso a la cookie httpOnly pueda saber si hay sesión activa.

#### Scenario: Sesión activa
- **WHEN** se envía `GET /api/auth/me` con una cookie de sesión válida
- **THEN** el sistema responde 200 con `{ restaurantId }` correspondiente al JWT de la cookie

#### Scenario: Sin sesión activa
- **WHEN** se envía `GET /api/auth/me` sin cookie de sesión o con un JWT inválido/expirado
- **THEN** el sistema responde 401
