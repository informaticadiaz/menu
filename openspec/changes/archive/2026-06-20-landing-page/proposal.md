## Why

La ruta raíz (`/`) del frontend de Fuego todavía muestra el contenido por defecto de `create-next-app` (logo de Next.js, botón "Deploy Now" a Vercel, texto "To get started, edit the page.tsx file"). Nunca fue reemplazado durante el desarrollo de signup, admin y menú público. Un visitante que llega a `/` no entiende qué es Fuego ni tiene forma de avanzar hacia registrarse o loguearse.

## What Changes

- Reemplazar `frontend/app/page.tsx` por una landing real de Fuego.
- La landing comunica la propuesta de valor (menú digital para restaurantes pequeños) y ofrece dos caminos claros: crear una cuenta nueva (`/signup`) o ingresar a una cuenta existente (`/admin`).
- Eliminar referencias al boilerplate de Next.js/Vercel (logo, copy, links de "Deploy Now" y "Documentation").

## Capabilities

### New Capabilities
- `landing-page`: página pública en `/` que presenta Fuego y dirige al visitante a `/signup` o `/admin`.

### Modified Capabilities
(ninguna — no hay specs existentes archivadas que cambien de comportamiento; `/signup` y `/admin` se enlazan pero no se modifican)

## Impact

- Código: `frontend/app/page.tsx` (reemplazo completo).
- No afecta backend, APIs ni datos.
- No hay breaking changes: `/` no tenía contenido funcional propio que algo dependiera de él.
