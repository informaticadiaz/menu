## Context

El backend (Hono + better-sqlite3) ya tiene la tabla `admin_users` (`restaurant_id`, `email`, `password_hash`) pero ningún endpoint la usa. Los endpoints de escritura del menú (`POST/PUT/DELETE /api/menu-items`) son públicos hoy. No hay ningún mecanismo de sesión, ni en backend ni en frontend. El frontend es un scaffold de Next.js App Router sin páginas propias todavía.

No hay multi-tenancy real en el cliente: cada restaurante tiene un solo admin (constraint `UNIQUE` en `admin_users.restaurant_id`), así que el modelo de auth es simple — un admin gestiona el menú de un único restaurante.

## Goals / Non-Goals

**Goals:**
- Login seguro de admins contra `admin_users` (password hasheada, nunca en texto plano).
- Proteger los endpoints de escritura de `menu-items` para que solo el admin del restaurante dueño del item pueda modificarlo.
- Dar al admin una interfaz funcional para gestionar su menú sin tocar la base de datos directamente.

**Non-Goals:**
- Registro de nuevos restaurantes/admins desde la UI (se resuelve con un script de seed/CLI, igual que hoy se crea el restaurante de ejemplo).
- Múltiples admins por restaurante, roles o permisos granulares.
- Recuperación de contraseña por email.
- Refresh tokens / rotación de sesión — un JWT de vida corta-media es suficiente para este alcance.

## Decisions

**JWT stateless en vez de sesiones server-side.** El backend es un proceso único sin Redis ni store de sesiones; agregar uno solo para esto sería sobre-ingeniería. Un JWT firmado con `JWT_SECRET` (env var), con `restaurant_id` y `admin_id` en el payload y expiración de 7 días, es suficiente y sin estado.

**bcrypt para hashing de password.** Es el estándar de facto en Node, sin dependencias nativas problemáticas en este entorno (a diferencia de `argon2`, que requiere compilación nativa y ya tenemos `better-sqlite3` como única dependencia nativa). Se usa `bcryptjs` (puro JS) para evitar problemas de build en el Dockerfile multi-stage existente.

**Middleware de auth en Hono que verifica JWT y carga `restaurant_id` en el contexto.** Se aplica solo a las rutas de escritura de `/api/menu-items` y a `/api/admin/menu`. El middleware además verifica que el `restaurant_id` del item que se edita/borra coincida con el del token, devolviendo 403 si no.

**Token persistido en `localStorage` en el frontend, no en cookie.** El frontend y backend corren en orígenes distintos (puertos 3000/3001) sin dominio compartido en desarrollo; usar cookies cross-site agrega complejidad de `SameSite`/CORS sin beneficio real para este alcance (no hay XSS mitigation adicional relevante dado que es una SPA simple sin contenido de terceros). Se documenta como mejora futura migrar a cookie `httpOnly` si se expone a producción con dominio propio.

**Alta del primer admin vía script de seed, no vía endpoint público.** No agregar un endpoint de registro evita la superficie de ataque de crear admins arbitrarios. Se extiende `npm run seed` para crear un admin de ejemplo (`admin@fuego-ba.com` / password de ejemplo) atado al restaurante semilla.

## Risks / Trade-offs

- [`localStorage` es vulnerable a XSS] → Mitigación: el frontend no renderiza HTML/contenido de terceros sin sanitizar; se documenta como deuda técnica si el proyecto crece.
- [JWT sin revocación: si se compromete un token, es válido hasta expirar] → Mitigación: expiración corta (7 días) y `JWT_SECRET` fuera del repo (env var), documentado en `.env.example`.
- [Sin endpoint de registro, alta de nuevos restaurantes requiere acceso a la consola/seed] → Aceptado como Non-Goal explícito; se resuelve manualmente por ahora.

## Migration Plan

1. Agregar dependencias (`jsonwebtoken`, `bcryptjs`) al backend.
2. Agregar `JWT_SECRET` a `.env.example` y documentar que es obligatorio en producción.
3. Implementar middleware y endpoints de auth; aplicar el middleware a las rutas de escritura existentes (cambio breaking para cualquier cliente actual de esos endpoints, pero no hay clientes en producción todavía).
4. Extender el seed para crear el admin de ejemplo.
5. Implementar frontend (`/admin/login`, `/admin`).
6. No requiere migración de datos: `admin_users` ya existe vacía.

## Open Questions

- Ninguna pendiente para este alcance; decisiones de alcance futuro (multi-admin, recuperación de password, cookies httpOnly) quedan documentadas como Non-Goals.
