## 1. Backend: cookie de sesión

- [x] 1.1 En `fuego/backend/src/index.ts`, cambiar `cors()` a `credentials: true` con `origin` explícito (lista de orígenes permitidos, sin fallback a `'*'`).
- [x] 1.2 En `fuego/backend/src/middleware/auth.ts`, leer el JWT desde una cookie (`hono/cookie` → `getCookie`) en vez del header `Authorization`. Mantener el nombre de la cookie en una constante compartida (ej. `fuego/backend/src/auth.ts`).
- [x] 1.3 En `POST /api/auth/login` (`index.ts`), reemplazar `return c.json({ token })` por `setCookie` con el JWT (httpOnly, `sameSite: 'Lax'`, `path: '/'`, `maxAge` acorde a los 7 días de expiración del JWT) y responder sin el token en el body.
- [x] 1.4 En `POST /api/auth/signup` (`index.ts`), aplicar el mismo cambio: `setCookie` en vez de `{ token, ... }` en el body (mantener `restaurant` en la respuesta).
- [x] 1.5 Agregar `POST /api/auth/logout`: `deleteCookie` de la cookie de sesión, responde 200 siempre (idempotente).
- [x] 1.6 Agregar `GET /api/auth/me`, protegido por `authMiddleware`, que responde `{ restaurantId }` (200) o 401 según validez de la cookie.

## 2. Frontend: proxy same-origin y cliente HTTP

- [x] 2.1 En `fuego/frontend/next.config.ts`, agregar `rewrites()` que mapee `/api/:path*` hacia la URL interna del backend (variable de entorno server-only, distinta de `NEXT_PUBLIC_API_URL`).
- [x] 2.2 En `fuego/.env.example` y `docker-compose.yml`, agregar la variable de entorno interna usada por el rewrite (ej. `BACKEND_INTERNAL_URL=http://backend:3001` en compose, `http://localhost:3001` en dev).
- [x] 2.3 En `fuego/frontend/lib/api.ts`, quitar el header `Authorization` y agregar `credentials: 'include'` a `apiFetch`; las llamadas pasan a usar el path relativo (`/api/...`) que resuelve el rewrite.
- [x] 2.4 Reescribir `fuego/frontend/lib/session.ts`: eliminar `getToken`/`setToken`/`clearToken` sobre `localStorage`; agregar una función que consulte `GET /api/auth/me` y un hook (`useSession` o similar) que expone `{ restaurantId } | null | 'loading'`.

## 3. Frontend: páginas que dependían de la sesión en cliente

- [x] 3.1 En `fuego/frontend/app/admin/login/page.tsx`, quitar `setToken(token)` (ya no hay token en la respuesta); tras un login 200, navegar a `/admin` directamente.
- [x] 3.2 En `fuego/frontend/app/signup/page.tsx`, quitar `setToken(data.token)`; tras un signup 201, navegar a `/admin` directamente.
- [x] 3.3 En `fuego/frontend/app/admin/layout.tsx`, reemplazar `useToken()` por el nuevo hook de sesión (`/api/auth/me`); mantener el comportamiento de redirigir a `/admin/login` si no hay sesión, salvo en la propia página de login.
- [x] 3.4 Agregar `POST /api/auth/logout` al flujo de cierre de sesión existente en el panel (donde hoy se llame a `clearToken()`), y navegar a `/admin/login` después.

## 4. Frontend: `admin/page.tsx` a Server Component

- [x] 4.1 Crear un componente cliente (ej. `admin/menu-panel.tsx`) con toda la UI interactiva que hoy vive en `admin/page.tsx` (listado, alta/edición/borrado, disponibilidad, upload de imagen), recibiendo los items iniciales como prop.
- [x] 4.2 Convertir `admin/page.tsx` en Server Component: leer la cookie de sesión (`next/headers`), hacer el fetch a `GET /api/admin/menu` server-side adjuntando la cookie, y pasar `items` al componente cliente de 4.1.
- [x] 4.3 Si el fetch server-side responde 401, `redirect('/admin/login')` desde el Server Component (sin pasar por el `useEffect` de `admin/layout.tsx` para esta página).
- [x] 4.4 Confirmar que `npm run lint` en `frontend/` ya no reporta `react-hooks/set-state-in-effect`.

## 5. Limpieza y verificación

- [x] 5.1 Confirmar que ningún código del backend sigue leyendo `Authorization: Bearer` (ya cubierto por 1.2, pero verificar que no quede un fallback).
- [x] 5.2 Probar manualmente: login, ver panel, crear/editar/borrar item, logout, signup de un restaurante nuevo con sesión inmediata, refresh de página manteniendo sesión.
- [x] 5.3 Actualizar `fuego/docs/deuda-tecnica.md`: marcar el ítem de `set-state-in-effect` como resuelto (o eliminarlo) una vez confirmado 4.4.
- [x] 5.4 Actualizar los specs archivados de `admin-auth` y `restaurant-signup` (`openspec sync-specs` o equivalente) para reflejar el nuevo mecanismo de sesión.
