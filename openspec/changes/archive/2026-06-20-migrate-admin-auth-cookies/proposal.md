## Why

El lint `react-hooks/set-state-in-effect` falla en `frontend/app/admin/page.tsx` y no tiene fix de raíz mientras el panel de admin haga su fetch inicial desde el cliente. La única forma de eliminar el problema es traer los items en un Server Component, pero eso requiere que el servidor pueda leer la sesión — y hoy la sesión vive en `localStorage`, inaccesible fuera del navegador. Migrar la sesión de admin a una cookie httpOnly desbloquea ese refactor y, de paso, mejora la postura de seguridad de la sesión (un JWT en `localStorage` es legible por cualquier script, incluido uno inyectado por XSS).

## What Changes

- **BREAKING**: `POST /api/auth/login` y `POST /api/auth/signup` dejan de devolver `{ token }` en el body; en su lugar emiten `Set-Cookie` con el JWT como cookie httpOnly.
- **BREAKING**: las rutas protegidas (`POST/PUT/DELETE /api/menu-items*`, `GET /api/admin/menu`) dejan de aceptar `Authorization: Bearer <token>`; `authMiddleware` lee el JWT desde la cookie.
- Se agrega `POST /api/auth/logout`, que borra la cookie de sesión (necesario porque el JS del cliente ya no puede borrarla).
- Se agrega `GET /api/auth/me`, que devuelve si hay sesión activa (y el `restaurant_id` asociado), para que el frontend sepa el estado de auth sin poder leer la cookie httpOnly directamente.
- El frontend (`fuego/frontend/next.config.ts`) agrega un rewrite que proxea `/api/*` hacia el backend, de forma que el navegador solo ve el origen del frontend. Esto evita que la cookie sea cross-origin, permitiendo `SameSite=Lax` sin `Secure`/HTTPS obligatorio en desarrollo local, y mitiga CSRF por defecto (un sitio externo no puede arrastrar la cookie en un request al mismo origen del frontend).
- `lib/session.ts` deja de leer/escribir `localStorage`; el estado de sesión en el cliente se deriva de `GET /api/auth/me`.
- `lib/api.ts` (`apiFetch`) deja de adjuntar el header `Authorization` y agrega `credentials: 'include'`.
- `admin/page.tsx` pasa a recibir los items del menú como prop desde un Server Component (`admin/page.tsx` se convierte en server, la UI interactiva se mueve a un componente cliente), eliminando el fetch-on-mount que dispara el lint. Esto resuelve la deuda documentada en `fuego/docs/deuda-tecnica.md`.

## Capabilities

### New Capabilities
(ninguna — este cambio modifica el mecanismo de transporte de una capability existente, no agrega una nueva)

### Modified Capabilities
- `admin-auth`: el JWT de sesión se transporta como cookie httpOnly (`Set-Cookie`) en vez de devolverse en el body y enviarse en el header `Authorization`; se agregan los requisitos de logout (`POST /api/auth/logout`) y de consulta de estado de sesión (`GET /api/auth/me`).
- `restaurant-signup`: el requisito "Sesión inmediata tras el signup" cambia de "JWT devuelto en el body y guardado por el cliente" a "cookie httpOnly emitida por el servidor".

## Impact

- **Backend** (`fuego/backend/src/index.ts`, `middleware/auth.ts`): `cors()` pasa a `credentials: true` con `origin` explícito (ya no puede caer a `'*'`); `authMiddleware` lee `hono/cookie` en vez del header `Authorization`; `login`/`signup` usan `setCookie` en vez de devolver el token; nuevo endpoint `logout` (`deleteCookie`) y `GET /api/auth/me`.
- **Frontend** (`fuego/frontend/next.config.ts`, `lib/api.ts`, `lib/session.ts`, `admin/layout.tsx`, `admin/page.tsx`, `admin/login/page.tsx`, `signup/page.tsx`): rewrite de `/api/*`, `apiFetch` con `credentials: 'include'`, sesión derivada de `/api/auth/me` en vez de `localStorage`, `admin/page.tsx` convertido a Server Component que delega la UI interactiva a un componente cliente.
- **Despliegue** (`docker-compose.yml`, `.env.example`): el rewrite de Next.js necesita saber la URL interna del backend (puede reusar `NEXT_PUBLIC_API_URL` server-side, o agregar una variable interna sin el prefijo `NEXT_PUBLIC_` si se quiere ocultarla del bundle del cliente).
- **Seguridad**: reduce superficie de robo de sesión vía XSS (la cookie httpOnly no es legible por JS); el rewrite same-origin + `SameSite=Lax` cubre la mayoría de CSRF, pero las rutas de escritura deberían seguir revisándose si se exponen consumidores cross-origin a futuro (fuera de alcance de este change).
