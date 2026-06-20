# Deuda técnica

## Lint: `react-hooks/set-state-in-effect` en `frontend/app/admin/page.tsx`

**Estado:** resuelto. Migrada la sesión de admin de `localStorage` a una cookie httpOnly
(change `migrate-admin-auth-cookies`), lo que permitió convertir `admin/page.tsx` en Server
Component (lee la cookie con `next/headers` y hace el fetch a `/api/admin/menu` server-side,
delegando la UI interactiva a `admin/menu-panel.tsx`). Sin fetch-on-mount en el cliente, `npm run
lint` en `frontend/` ya no reporta esta regla.

### Qué pasa

`eslint-config-next@16.2.9` trae `eslint-plugin-react-hooks@7.1.1`, que agrega como `error` la regla
`react-hooks/set-state-in-effect` (parte del set de reglas para el React Compiler). Esta regla marca
cualquier `setState` alcanzable —directa o indirectamente— desde el cuerpo de un efecto, sin distinguir
si ocurre antes o después de un `await`.

`AdminPage` usa el patrón estándar de "fetch on mount":

```tsx
const loadItems = useCallback(async () => {
  try {
    const data = await apiJson<{ items: MenuItem[] }>('/api/admin/menu');
    setItems(data.items);
  } catch (err) { /* ... setError(...) */ }
  finally { setLoading(false); }
}, [handleUnauthorized]);

useEffect(() => {
  loadItems();
}, [loadItems]);
```

La regla marca `loadItems()` dentro del efecto porque `loadItems` termina llamando `setItems` / `setError` /
`setLoading`, sin importar que esas llamadas ocurren después de un `await` (es decir, en un microtask
posterior, no de forma síncrona dentro del commit del efecto — que es el caso que la regla busca evitar).

### Por qué no se resolvió con un refactor menor

Se evaluó eliminar el `setLoading(true)`/`setError(null)` redundantes al inicio de `loadItems` (redundantes
porque el estado inicial ya es `loading=true`, `error=null` y la función solo se llama una vez, al montar).
Esto se aplicó (ver `git log` de `admin/page.tsx`) pero **no resolvió el error**: la regla sigue marcando el
`setItems`/`setError`/`setLoading(false)` que quedan después del `await`.

El único refactor que elimina el problema de raíz es sacar el fetch del cliente: traer los items en un
Server Component (como ya hace `frontend/app/menu/[slug]/page.tsx`) y pasarlos como prop al componente
interactivo. Eso requiere que el token de auth sea legible en el servidor, lo cual hoy no es posible:
el token vive en `localStorage` (solo accesible desde el navegador).

### Qué implicaría el fix real (migrar auth de localStorage a cookies)

Evaluado como cambio de arquitectura, no como refactor puntual:

**Backend** (`fuego/backend/src/index.ts`, `middleware/auth.ts`):
- `cors()` necesita `credentials: true` y un `origin` explícito (hoy cae a `'*'` por default, incompatible
  con cookies cross-origin).
- `authMiddleware` debe leer la cookie en vez del header `Authorization`.
- `login`/`signup` deben hacer `Set-Cookie` httpOnly en vez de devolver `{ token }` en el body.
- Hace falta un endpoint de **logout** nuevo: con cookie httpOnly, el JS del cliente no puede borrarla.

**Frontend** (`lib/api.ts`, `lib/session.ts`, `admin/layout.tsx`, `admin/page.tsx`, `login`, `signup`):
- `apiFetch` necesita `credentials: 'include'` en vez de adjuntar el Bearer token.
- Con httpOnly, el JS no puede leer si hay sesión activa — hace falta otro mecanismo para que la UI lo sepa
  (cookie de bandera no-httpOnly, o un endpoint `/api/auth/me`).

**Riesgo no trivial:** frontend (puerto 3000) y backend (puerto 3001) son orígenes distintos. Para que la
cookie viaje cross-origin, los navegadores exigen `SameSite=None; Secure`, lo que **requiere HTTPS incluso
en desarrollo local** (o un proxy/rewrite que unifique el origen). Además, auth por cookie sin mitigación
adicional es vulnerable a CSRF en requests `POST`/`PUT`/`DELETE`.

### Decisión

Se deja como deuda conocida. No se implementa sin spec aprobado dado el tamaño y las implicancias de
seguridad. Si se decide encarar la migración, abrir un change de OpenSpec (`openspec propose`) antes de
tocar código.

## El redirect a `/admin/login` en `admin/page.tsx` no emite un 307 HTTP real

**Estado:** conocido, no resuelto. Funciona para usuarios reales (navegador), pero no para clientes sin JS.

### Qué pasa

`admin/page.tsx` (Server Component) llama a `redirect('/admin/login')` cuando el fetch a
`/api/admin/menu` responde 401. Según la documentación de Next.js, `redirect()` debería devolver un
307 HTTP cuando se usa fuera de un contexto de streaming. En la práctica, comprobado tanto en `next
dev` como en un build de producción (`next build && next start`), la respuesta es **200** con la
instrucción de redirect embebida en el payload RSC (`NEXT_REDIRECT;replace;/admin/login;307;`) en vez
de un 307 real:

```
$ curl -i http://localhost:3000/admin   # sin cookie de sesión
HTTP/1.1 200 OK
...
```

El redirect sí se ejecuta correctamente en un navegador real: el cliente de Next.js detecta el
marcador `NEXT_REDIRECT` en el stream RSC y hace un `router.replace('/admin/login')` apenas hidrata,
antes de que el usuario vea contenido del panel. El problema es solo para clientes que no ejecutan JS
(curl, healthchecks, crawlers, tests que esperan un 307 literal).

### Por qué pasa

`/admin` está envuelto por `admin/layout.tsx`, que es un Client Component (`'use client'`). Next.js
empieza a transmitir (stream) el HTML del layout antes de que `AdminPage` (el Server Component hijo)
resuelva su fetch a `/api/admin/menu` y decida si redirige. Una vez que el servidor ya envió la
cabecera `200` y empezó a mandar bytes del body, no puede retroactivamente cambiar el status code a
307 — por eso Next.js cae al mecanismo documentado para "streaming context": insertar la instrucción
de redirect en el stream para que el cliente la resuelva. Confirmado que no es un problema de modo
dev: persiste en el build de producción.

Como contraste, `notFound()` en `frontend/app/menu/[slug]/page.tsx` sí devuelve un 404 real, porque
esa ruta no tiene un Client Component layout intermedio forzando el streaming antes de que el fetch
resuelva.

### Posibles caminos (no implementados)

- Mover la decisión de redirect a un punto donde no haya streaming previo (ej. un middleware/proxy de
  Next.js que lea la cookie antes de tocar cualquier Server Component), a costa de no poder usar el
  401 real del backend como fuente de verdad sin una llamada adicional en el middleware.
- Convertir `admin/layout.tsx` en Server Component y mover la lógica de redirect-si-no-hay-sesión que
  hoy vive ahí hacia un mecanismo que no dependa de un layout cliente envolviendo la página.
- Aceptarlo como límite conocido si ningún consumidor sin JS depende del status code de `/admin`.

### Decisión

Se deja como deuda conocida. No bloquea el uso real de la app (navegador), pero cualquier test e2e o
healthcheck que asuma un 307 literal en `/admin` sin sesión va a fallar — hay que pegarle a
`/api/auth/me` o revisar el contenido del body en vez del status code.

## Changes de OpenSpec marcados "complete" pero nunca archivados

**Estado:** conocido, no resuelto.

### Qué pasa

`admin-panel`, `restaurant-signup`, `public-menu-page` y `landing-page` (en `openspec/changes/`)
tienen todas sus tareas marcadas `[x]` (`openspec list --json` los reporta `status: complete`), pero
ninguno se archivó nunca. Como consecuencia, `openspec/specs/` no tenía specs principales para
ninguna capability hasta el 2026-06-20: al ejecutar la tarea 5.4 de `migrate-admin-auth-cookies`
("sincronizar specs archivados de admin-auth y restaurant-signup") no había nada que sincronizar
todavía.

Se reconstruyeron a mano `openspec/specs/admin-auth/spec.md` y `openspec/specs/restaurant-signup/spec.md`,
fusionando los deltas originales de `admin-panel`/`restaurant-signup` con el delta de
`migrate-admin-auth-cookies`. Quedó pendiente `admin-menu-panel` (introducida por `admin-panel`), que
sigue sin spec principal porque `migrate-admin-auth-cookies` no la declaraba como capability
modificada y por lo tanto no era parte de esa tarea.

### Decisión

Se deja como deuda conocida; no se archivaron los 4 changes viejos para no expandir el alcance de
`migrate-admin-auth-cookies`. Cuando se decida archivarlos (`openspec archive` o `/opsx:archive` por
cada uno), va a quedar también sincronizado `admin-menu-panel` y cualquier otra capability que esos
changes hayan introducido.
