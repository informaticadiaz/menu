## ADDED Requirements

### Requirement: Límite diario global de signup
El sistema SHALL permitir como máximo una creación exitosa de cuenta por día UTC mediante `POST /api/auth/signup`, contando como cuenta creada el restaurante insertado correctamente por el flujo de signup.

#### Scenario: Primer signup del día permitido
- **WHEN** se envía `POST /api/auth/signup` con datos válidos y no existe ningún restaurante creado durante el día UTC actual
- **THEN** el sistema crea el restaurante y el admin asociado, emite la cookie httpOnly de sesión y responde 201 como en el flujo exitoso existente

#### Scenario: Signup adicional del mismo día rechazado
- **WHEN** se envía `POST /api/auth/signup` con datos válidos y ya existe un restaurante creado durante el día UTC actual
- **THEN** el sistema responde 429 con un mensaje explícito de límite diario, sin crear restaurante, admin ni cookie de sesión

#### Scenario: Rechazo concurrente seguro
- **WHEN** dos solicitudes válidas de `POST /api/auth/signup` intentan crear cuenta para el mismo día UTC al mismo tiempo
- **THEN** el sistema permite como máximo una creación y rechaza cualquier creación adicional sin dejar datos huérfanos
