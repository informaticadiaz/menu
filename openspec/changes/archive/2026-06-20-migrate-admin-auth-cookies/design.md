## Context

`admin-auth` (propuesta `admin-panel`) y `restaurant-signup` emiten hoy un JWT que el cliente guarda en `localStorage` (`fuego/frontend/lib/session.ts`) y reenvía en `Authorization: Bearer <token>` (`fuego/frontend/lib/api.ts`). Esto está documentado como deuda técnica en `fuego/docs/deuda-tecnica.md`: el lint `react-hooks/set-state-in-effect` no se puede resolver de raíz en `admin/page.tsx` sin mover el fetch del menú a un Server Component, y eso exige que el servidor pueda leer la sesión — imposible con `localStorage`.

Frontend y backend corren en orígenes distintos tanto en desarrollo (`localhost:3000` / `localhost:3001`) como en `docker-compose.yml` (mismo esquema de puertos). Una cookie cross-origin necesita `SameSite=None; Secure`, lo que obliga a HTTPS incluso en desarrollo local y abre superficie de CSRF en los endpoints de escritura.

## Goals / Non-Goals

**Goals:**
- Eliminar `localStorage` como almacenamiento de la sesión de admin; el JWT pasa a vivir en una cookie httpOnly.
- Hacer que la sesión sea legible desde un Server Component, desbloqueando el fix de raíz del lint en `admin/page.tsx`.
- Evitar el requisito de HTTPS en desarrollo local para que la cookie funcione.
- Mantener (o mejorar) la protección CSRF actual, que hoy es inexistente porque no hay cookies en juego.

**Non-Goals:**
- No se cambia el formato ni el contenido del JWT (`adminId`, `restaurantId`, expiración 7 días).
- No se agrega refresh token ni rotación de sesión — sigue siendo un único JWT de vida fija.
- No se audita ni se endurece CSRF más allá de lo que el same-origin + `SameSite=Lax` cubre por defecto (queda anotado como riesgo, no resuelto en este change).

## Decisions

### 1. Proxy same-origin vía rewrite de Next.js, en vez de cookie cross-origin

Se agrega un rewrite en `frontend/next.config.ts` que mapea `/api/*` (las requests que hoy hace `apiFetch`) hacia el backend (`NEXT_PUBLIC_API_URL` o una variable interna equivalente). El navegador solo conoce el origen del frontend; Next.js reenvía la request al backend y relay-ea la respuesta (incluyendo `Set-Cookie`) sin que el browser se entere de que hubo un segundo origen involucrado.

**Alternativa descartada**: cookie cross-origin con `SameSite=None; Secure`. Requiere HTTPS en desarrollo local (certificados locales o un túnel), agrega complejidad operativa permanente y deja CSRF abierto en escritura salvo que se agregue un mecanismo aparte (token CSRF, verificación de `Origin`). El rewrite resuelve ambos problemas de una vez y es el camino que ya sugería `fuego/docs/deuda-tecnica.md` como mitigación.

**Costo aceptado**: todas las requests al backend pasan por un hop adicional (Next.js server) en vez de ir directo del browser al backend. Para el volumen de este proyecto (panel de admin de un restaurante) es insignificante.

### 2. `SameSite=Lax` (no `Strict`, no `None`)

Con el rewrite, la cookie es same-origin desde la perspectiva del browser, así que `Lax` alcanza: bloquea que un sitio externo dispare requests con la cookie adjunta (cubre CSRF en `POST`/`PUT`/`DELETE`, que nunca son navegación top-level), y no rompe el flujo normal de uso del panel (no hay navegación cross-site al panel que dependa de la cookie).

### 3. `GET /api/auth/me` para que el cliente conozca el estado de sesión

Con cookie httpOnly, el JS del cliente no puede leer si hay sesión activa. `admin/layout.tsx` (que hoy decide si redirige a `/admin/login` mirando `useToken()`) necesita una fuente de verdad. Se agrega `GET /api/auth/me`, protegido por `authMiddleware`, que devuelve `{ restaurantId }` si la cookie es válida o 401 si no. El layout lo consulta una vez al montar.

**Alternativa descartada**: cookie de bandera no-httpOnly (ej. `has_session=1`) que el JS pueda leer sin pegarle al backend. Es más rápido pero duplica el estado (la bandera y la cookie real pueden desincronizarse, ej. si el JWT expira pero la bandera no se borró) y no decíamos nada del `restaurantId` que el panel podría necesitar. Se prioriza una sola fuente de verdad sobre la latencia de un request extra.

### 4. `admin/page.tsx` pasa a Server Component

El Server Component lee la cookie (`next/headers`), hace el fetch a `/api/admin/menu` server-side adjuntando esa cookie, y pasa los items como prop a un componente cliente que mantiene la interactividad (alta/edición/borrado/disponibilidad). Esto es exactamente el patrón que ya usa `frontend/app/menu/[slug]/page.tsx`, y es el fix de raíz que noteaba `fuego/docs/deuda-tecnica.md`.

La redirección a `/admin/login` cuando no hay sesión se decide en el Server Component (si el fetch a `/api/admin/menu` devuelve 401, `redirect('/admin/login')`), no en un `useEffect` del cliente — eliminando también la necesidad de `admin/layout.tsx` de chequear el token en el cliente para esa página. `admin/login` sigue siendo cliente (necesita interactividad de formulario) y sigue usando `/api/auth/me` para evitar mostrarse si ya hay sesión activa.

## Risks / Trade-offs

- **[Riesgo] El rewrite acopla el deploy del frontend a poder alcanzar el backend server-side** (hoy el browser le pega directo al backend; con el rewrite, el servidor de Next.js necesita red hacia el backend). → Mitigación: en `docker-compose.yml` ambos servicios ya están en la misma red (`fuego-network`); se usa el nombre del servicio (`http://backend:3001`) como destino del rewrite en producción, separado de `NEXT_PUBLIC_API_URL` (que ya no debería usarse desde el cliente una vez migrado `apiFetch`).
- **[Riesgo] `SameSite=Lax` no es protección CSRF completa** (no cubre, por ejemplo, un `<form>` GET que cambie estado, aunque este backend no tiene mutaciones por GET). → Mitigación: no se hace nada adicional en este change; se deja anotado como límite conocido, no como deuda nueva silenciosa.
- **[Riesgo] Romper sesiones existentes en producción al desplegar** (los admins logueados con un JWT en `localStorage` quedan con un token que el backend ya no acepta desde `Authorization`). → Mitigación: no hay usuarios reales en producción todavía (proyecto en desarrollo); si los hubiera, se aceptaría que tengan que volver a loguearse una vez.
- **[Trade-off] Un hop adicional (Next.js → backend) en cada request del panel**, contra eliminar HTTPS-en-dev y la superficie de CSRF cross-origin. Se considera la opción correcta para el tamaño actual del proyecto.

## Migration Plan

1. Backend: agregar soporte de cookie en paralelo al header `Authorization` (transición), agregar `logout` y `/api/auth/me`.
2. Frontend: agregar el rewrite, migrar `apiFetch` a `credentials: 'include'`, migrar `lib/session.ts` a consultar `/api/auth/me`.
3. Una vez verificado el flujo end-to-end (login, panel, logout, signup), quitar el soporte de `Authorization` header del backend (ya no quedan clientes que lo usen).
4. Migrar `admin/page.tsx` a Server Component.
5. No hay rollback de datos (no hay migración de esquema); rollback es revertir el deploy del frontend y backend a la versión anterior.

## Open Questions

- Ninguna abierta: las decisiones de arquitectura (proxy same-origin, `SameSite=Lax`, `/api/auth/me`) quedan resueltas arriba. Si en el futuro se agrega un consumidor cross-origin real (ej. una app móvil nativa) del mismo backend, va a necesitar un mecanismo de auth aparte (no cookie) — fuera de alcance de este change.
