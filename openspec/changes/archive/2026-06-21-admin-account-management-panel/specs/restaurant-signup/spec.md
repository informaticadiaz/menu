## MODIFIED Requirements

### Requirement: Alta self-service de restaurante y admin
El sistema SHALL permitir crear un restaurante nuevo activo junto con su admin asociado en una sola operación atómica mediante `POST /api/auth/signup`, recibiendo nombre del restaurante, slug (opcional), email y password.

#### Scenario: Signup exitoso con slug provisto
- **WHEN** se envía `POST /api/auth/signup` con nombre, un slug válido y disponible, email no registrado y password
- **THEN** el sistema crea el restaurante activo y el admin asociado, y responde 201 con los datos del restaurante creado, dejando al admin autenticado mediante una cookie httpOnly de sesión (sin JWT en el body)

#### Scenario: Signup exitoso sin slug provisto
- **WHEN** se envía `POST /api/auth/signup` sin slug
- **THEN** el sistema genera un slug a partir del nombre del restaurante y lo usa para la creación del restaurante activo

#### Scenario: Fallo a mitad de camino no deja datos huérfanos
- **WHEN** la creación del admin falla después de haberse iniciado la creación del restaurante (por cualquier motivo dentro de la transacción)
- **THEN** el sistema revierte completamente la operación, sin dejar un restaurante sin admin asociado
