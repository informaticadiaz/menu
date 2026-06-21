## Why

El signup self-service actualmente permite crear cuentas sin límite ni costo, lo que expone la aplicación a abuso mediante creación masiva de restaurantes y admins. Esta restricción reduce el riesgo de ataques automatizados sin eliminar el flujo gratuito existente.

## What Changes

- Limitar la creación exitosa de cuentas nuevas a una por día.
- Rechazar intentos adicionales de signup dentro del mismo día con un error explícito, sin crear restaurante, admin ni sesión.
- Mantener el signup gratuito y self-service cuando no exista otra cuenta creada ese día.
- Registrar la validación como parte del contrato de `POST /api/auth/signup`.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `restaurant-signup`: Agrega una restricción diaria global para permitir como máximo una cuenta nueva creada por día mediante signup.

## Impact

- Backend de `POST /api/auth/signup` y su validación previa a la creación transaccional.
- Modelo o consulta usada para determinar si ya hubo una cuenta/restaurante creado durante el día actual.
- Respuestas de error del signup y manejo del mensaje en el formulario público.
- Tests de signup exitoso y de rechazo por límite diario.
