## Context

Fuego ya tiene dos conceptos implementados: negocios/restaurantes que se registran por `/signup`, y admins de negocio que ingresan por `/admin/login` para gestionar su propio menú en `/admin`. No existe una herramienta interna para el fundador/programador que permita observar y controlar todos los negocios registrados.

El nuevo panel debe estar separado del panel de negocio para evitar mezclar permisos. Un admin de negocio nunca debe poder acceder a la administración interna, y el administrador interno no debe depender de pertenecer a un restaurante.

## Goals / Non-Goals

**Goals:**
- Crear una autenticación interna para el administrador del sistema.
- Crear un panel interno para listar todos los negocios registrados.
- Permitir crear, pausar, reactivar y eliminar negocios desde ese panel.
- Bloquear login y uso autenticado de negocios pausados.
- Mantener separadas las rutas, cookies y permisos del panel interno y del panel de negocio.

**Non-Goals:**
- No agregar roles múltiples ni permisos granulares para equipos internos.
- No agregar auditoría completa de acciones administrativas.
- No agregar facturación, planes, métricas ni analytics.
- No cambiar el flujo público de menú ni el editor de menú salvo por el bloqueo de negocios pausados.

## Decisions

- Usar una tabla `system_admin_users` para credenciales internas.
  - Rationale: el administrador interno no representa un negocio y no debe usar `admin_users`, que está unido a `restaurant_id`.
  - Alternativa considerada: agregar un flag de superadmin a `admin_users`; se descarta porque mezclaría identidades internas con cuentas de negocio.

- Agregar estado del negocio en `restaurants`, por ejemplo `status TEXT NOT NULL DEFAULT 'active'` con valores `active` y `paused`.
  - Rationale: el estado pertenece al negocio completo, no solo al usuario admin; pausar un negocio debe bloquear su acceso como unidad.
  - Alternativa considerada: agregar `paused_at` en `admin_users`; se descarta porque un negocio podría tener más datos asociados y el control operativo corresponde al negocio.

- Usar endpoints bajo `/api/system/*` protegidos por middleware propio de admin interno.
  - Rationale: separa claramente las APIs internas de las APIs de negocio (`/api/admin/*`) ya existentes.
  - Alternativa considerada: reutilizar `/api/admin/*`; se descarta por ambiguedad entre admin interno y admin de negocio.

- Usar una cookie de sesión interna distinta, por ejemplo `fuego_system_session`.
  - Rationale: evita colisiones con `fuego_session` y permite que un navegador pueda probar ambos flujos sin mezclar identidades.
  - Alternativa considerada: una sola cookie con claim de rol; se descarta para minimizar riesgo de autorización cruzada.

- Implementar creación manual de negocio reutilizando las mismas reglas centrales del signup cuando sea posible.
  - Rationale: evita divergencias en validación de slug, email único y password hash.
  - Alternativa considerada: llamar internamente al endpoint público de signup; se descarta porque el signup tiene límite diario público y emite sesión de negocio.

## Risks / Trade-offs

- Acceso interno expuesto publicamente -> mitigar con credenciales separadas, cookie httpOnly, middleware dedicado y rutas frontend no enlazadas desde la experiencia pública.
- Eliminación accidental de negocio -> mitigar con confirmación explícita en UI y borrado por endpoint protegido; el borrado usa `ON DELETE CASCADE` existente.
- Migración SQLite sin framework formal -> mitigar con cambios idempotentes en inicialización (`ALTER TABLE` seguro si falta columna, `CREATE TABLE IF NOT EXISTS`).
- Negocios pausados con sesión existente -> mitigar validando `restaurants.status` en el middleware de negocio, no solo en login.

## Migration Plan

- Crear tabla `system_admin_users` si no existe.
- Agregar columna `restaurants.status` con default `active` si no existe.
- Seedear un administrador interno inicial desde variables de entorno o valores de desarrollo solo fuera de producción.
- Mantener rollback manual simple: eliminar rutas frontend/API nuevas y dejar `status` sin uso; los negocios activos siguen funcionando.

## Open Questions

- Definir las credenciales iniciales del administrador interno para producción antes de desplegar.
