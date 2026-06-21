## Why

El administrador interno del sistema puede crear, pausar, reactivar y eliminar negocios, pero no puede asistir a un negocio que perdió acceso a su cuenta. Esto obliga a intervenir manualmente la base de datos para restablecer una contraseña de admin de negocio.

## What Changes

- Agregar una acción protegida para que el administrador interno restablezca la contraseña del admin asociado a un negocio.
- Exponer un endpoint interno que reciba una nueva contraseña, actualice `admin_users.password_hash` con bcrypt y no devuelva la contraseña ni el hash.
- Agregar la acción correspondiente en la UI de `/system`, con confirmación/entrada explícita de la nueva contraseña.
- Mantener la autenticación del negocio basada en el hash actualizado; no se emiten sesiones nuevas automáticamente para el negocio.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `system-account-admin`: agrega restablecimiento de contraseña del admin de un negocio desde el panel interno.

## Impact

- Backend: `fuego/backend/src/index.ts` para nuevo endpoint bajo `/api/system/restaurants/:id/...`.
- UI: `fuego/frontend/app/system/system-panel.tsx` para agregar la acción en cada negocio.
- Datos: actualiza `admin_users.password_hash`; no requiere migración de esquema.
- Seguridad: requiere sesión `fuego_system_session`; la nueva contraseña solo viaja en el request y nunca se persiste en texto plano.
