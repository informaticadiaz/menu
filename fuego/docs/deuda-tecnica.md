# Deuda técnica

## Lint: `react-hooks/set-state-in-effect` en `frontend/app/admin/page.tsx`

**Estado:** conocido, no resuelto. `npm run lint` en `frontend/` falla por este error.

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
