# restaurant-signup Specification

## Purpose

Permitir que un restaurante se registre de forma self-service junto con su admin, quedando autenticado de inmediato sin un login adicional.

## Requirements

### Requirement: Alta self-service de restaurante y admin
El sistema SHALL permitir crear un restaurante nuevo junto con su admin asociado en una sola operación atómica mediante `POST /api/auth/signup`, recibiendo nombre del restaurante, slug (opcional), email y password.

#### Scenario: Signup exitoso con slug provisto
- **WHEN** se envía `POST /api/auth/signup` con nombre, un slug válido y disponible, email no registrado y password
- **THEN** el sistema crea el restaurante y el admin asociado, y responde 201 con los datos del restaurante creado, dejando al admin autenticado mediante una cookie httpOnly de sesión (sin JWT en el body)

#### Scenario: Signup exitoso sin slug provisto
- **WHEN** se envía `POST /api/auth/signup` sin slug
- **THEN** el sistema genera un slug a partir del nombre del restaurante y lo usa para la creación

#### Scenario: Fallo a mitad de camino no deja datos huérfanos
- **WHEN** la creación del admin falla después de haberse iniciado la creación del restaurante (por cualquier motivo dentro de la transacción)
- **THEN** el sistema revierte completamente la operación, sin dejar un restaurante sin admin asociado

### Requirement: Validación y generación de slug único
El sistema SHALL garantizar que el slug del restaurante creado sea único, url-safe, y resolver automáticamente colisiones cuando el slug provisto o derivado ya exista.

#### Scenario: Slug provisto ya existe
- **WHEN** el slug enviado en el signup ya pertenece a otro restaurante
- **THEN** el sistema responde con un error 409 indicando que el slug ya está tomado, sin crear nada

#### Scenario: Slug derivado del nombre colisiona
- **WHEN** no se provee slug y el slug generado a partir del nombre ya existe
- **THEN** el sistema agrega un sufijo numérico incremental (`-2`, `-3`, ...) hasta encontrar un slug libre, y lo usa para la creación

#### Scenario: Slug con formato inválido
- **WHEN** el slug provisto contiene caracteres fuera de minúsculas, números y guiones
- **THEN** el sistema responde 400 indicando el formato esperado, sin crear nada

### Requirement: Validación de email único
El sistema SHALL rechazar el signup si el email provisto ya está registrado en `admin_users`.

#### Scenario: Email ya registrado
- **WHEN** el email enviado en el signup ya existe en `admin_users`
- **THEN** el sistema responde 409 indicando que el email ya está en uso, sin crear nada

### Requirement: Sesión inmediata tras el signup
El sistema SHALL dejar al admin recién creado autenticado, sin requerir un login adicional, mediante una cookie httpOnly de sesión emitida por el backend al responder el signup; el frontend detecta la sesión activa (vía `/api/auth/me`) y navega al panel sin guardar ningún token explícitamente.

#### Scenario: Redirección al panel tras signup exitoso
- **WHEN** el formulario de `/signup` recibe una respuesta exitosa del backend (que incluye `Set-Cookie` con la sesión)
- **THEN** la aplicación navega directamente a `/admin`, sin pasar por `/admin/login` y sin manipular almacenamiento local

#### Scenario: Error de validación mostrado en el formulario
- **WHEN** el backend responde 409 (slug o email duplicado) o 400 (formato inválido)
- **THEN** el formulario de `/signup` muestra el mensaje de error específico junto al campo correspondiente, sin perder los demás valores ingresados, y no se emite ninguna cookie de sesión
