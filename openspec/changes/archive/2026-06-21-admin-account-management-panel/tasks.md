## 1. Base de Datos y Autenticación Interna

- [x] 1.1 Agregar migración idempotente para `restaurants.status` con default `active`.
- [x] 1.2 Crear tabla `system_admin_users` para credenciales del administrador interno.
- [x] 1.3 Agregar seed de administrador interno para desarrollo y requerir configuración segura en producción.
- [x] 1.4 Definir constantes y helpers de sesión interna usando cookie separada `fuego_system_session`.
- [x] 1.5 Implementar middleware de autenticación interna para rutas `/api/system/*`.

## 2. Bloqueo de Negocios Pausados

- [x] 2.1 Actualizar `POST /api/auth/login` para rechazar credenciales válidas de negocios pausados con 403.
- [x] 2.2 Actualizar `authMiddleware` de negocio para validar que el restaurante del JWT sigue activo.
- [x] 2.3 Confirmar que `GET /api/auth/me`, `GET /api/admin/menu` y escrituras de menú devuelven 403 para negocios pausados.
- [x] 2.4 Asegurar que `POST /api/auth/signup` crea negocios con estado `active`.

## 3. API de Administración de Negocios

- [x] 3.1 Implementar `POST /api/system/auth/login` y logout interno si aplica.
- [x] 3.2 Implementar `GET /api/system/restaurants` con datos de negocio, estado, fecha de creación y email admin.
- [x] 3.3 Implementar `POST /api/system/restaurants` para crear negocio y admin asociado de forma atómica.
- [x] 3.4 Implementar `POST /api/system/restaurants/:id/pause`.
- [x] 3.5 Implementar `POST /api/system/restaurants/:id/reactivate`.
- [x] 3.6 Implementar `DELETE /api/system/restaurants/:id` con respuesta 404 si no existe.

## 4. Panel Interno Frontend

- [x] 4.1 Crear ruta de login interno separada del login de negocio.
- [x] 4.2 Crear ruta `/system` protegida por sesión interna.
- [x] 4.3 Mostrar listado de negocios con estado, slug, fecha de creación y email admin.
- [x] 4.4 Agregar formulario para crear negocio manualmente.
- [x] 4.5 Agregar acciones de pausar/reactivar con actualización visible del estado.
- [x] 4.6 Agregar acción de eliminar con confirmación explícita.

## 5. Verificación

- [x] 5.1 Verificar login interno exitoso e inválido.
- [x] 5.2 Verificar que un admin de negocio no puede acceder a `/api/system/*`.
- [x] 5.3 Verificar crear, pausar, reactivar y eliminar negocio desde API y UI.
- [x] 5.4 Verificar que un negocio pausado no puede iniciar sesión ni usar una sesión existente.
- [x] 5.5 Ejecutar `npm run build` en backend y frontend, o documentar cualquier bloqueo.
