## ADDED Requirements

### Requirement: Login de administrador interno
El sistema SHALL permitir que un administrador interno se autentique con email y password separados de los admins de negocio, emitiendo una cookie httpOnly propia para acceder al panel interno.

#### Scenario: Login interno exitoso
- **WHEN** un administrador interno envía `POST /api/system/auth/login` con credenciales válidas
- **THEN** el sistema responde 200 y emite una cookie httpOnly de sesión interna que no reemplaza la cookie de sesión del negocio

#### Scenario: Credenciales internas inválidas
- **WHEN** un usuario envía `POST /api/system/auth/login` con email inexistente o password incorrecto
- **THEN** el sistema responde 401 con un mensaje genérico y no emite cookie de sesión interna

### Requirement: Protección del panel interno
El sistema SHALL proteger todas las rutas de API y UI de administración interna con sesión válida de administrador interno.

#### Scenario: Acceso sin sesión interna
- **WHEN** se solicita una ruta bajo `/system` o `/api/system/*` sin cookie interna válida
- **THEN** el sistema rechaza el acceso y no devuelve datos de negocios registrados

#### Scenario: Admin de negocio intenta acceder al panel interno
- **WHEN** un admin de negocio autenticado con `fuego_session` solicita una ruta interna sin `fuego_system_session`
- **THEN** el sistema rechaza el acceso como no autorizado

### Requirement: Listado de negocios registrados
El sistema SHALL permitir al administrador interno ver todos los negocios registrados con datos básicos del negocio, estado y admin asociado.

#### Scenario: Listado autorizado
- **WHEN** un administrador interno autenticado solicita `GET /api/system/restaurants`
- **THEN** el sistema responde 200 con todos los negocios, incluyendo id, nombre, slug, estado, fecha de creación y email del admin asociado

#### Scenario: Listado incluye negocios pausados
- **WHEN** existen negocios activos y pausados
- **THEN** el listado muestra ambos tipos y diferencia su estado

### Requirement: Creación manual de negocio
El sistema SHALL permitir al administrador interno crear un negocio con su admin asociado, usando nombre, slug opcional, email y password.

#### Scenario: Creación manual exitosa
- **WHEN** un administrador interno autenticado envía `POST /api/system/restaurants` con datos válidos
- **THEN** el sistema crea el negocio activo y su admin asociado en una operación atómica y responde 201 con los datos del negocio creado

#### Scenario: Email o slug duplicado
- **WHEN** la creación manual usa un email de admin o slug ya existente
- **THEN** el sistema responde 409 y no crea datos parciales

### Requirement: Pausa y reactivación de negocio
El sistema SHALL permitir al administrador interno pausar y reactivar negocios registrados.

#### Scenario: Pausar negocio
- **WHEN** un administrador interno autenticado envía `POST /api/system/restaurants/:id/pause` para un negocio activo
- **THEN** el sistema marca el negocio como pausado y responde 200

#### Scenario: Reactivar negocio
- **WHEN** un administrador interno autenticado envía `POST /api/system/restaurants/:id/reactivate` para un negocio pausado
- **THEN** el sistema marca el negocio como activo y responde 200

### Requirement: Eliminación de negocio
El sistema SHALL permitir al administrador interno eliminar un negocio registrado junto con sus datos dependientes.

#### Scenario: Eliminación exitosa
- **WHEN** un administrador interno autenticado envía `DELETE /api/system/restaurants/:id` para un negocio existente
- **THEN** el sistema elimina el negocio y responde 200

#### Scenario: Negocio inexistente
- **WHEN** un administrador interno autenticado intenta eliminar un negocio inexistente
- **THEN** el sistema responde 404 y no modifica otros negocios

### Requirement: UI de administración interna
El sistema SHALL proveer una interfaz interna para login, listado y acciones de gestión de negocios.

#### Scenario: Administrador interno gestiona negocios
- **WHEN** el administrador interno ingresa a `/system` con sesión válida
- **THEN** ve una tabla o lista de negocios con acciones para crear, pausar/reactivar y eliminar

#### Scenario: Confirmación de eliminación
- **WHEN** el administrador interno inicia la eliminación de un negocio
- **THEN** la UI solicita confirmación explícita antes de llamar al endpoint de eliminación
