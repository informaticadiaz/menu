## Why

Fuego es una plataforma de menús digitales pensada para que el cliente escanee un QR en la mesa y vea el menú del restaurante. Hoy ese endpoint (`GET /api/menu/:slug`) existe en el backend pero no hay ninguna pantalla en el frontend que lo consuma — sin esto, el producto no tiene la funcionalidad mínima que le da sentido (mostrarle el menú a un comensal).

## What Changes

- Se agrega la ruta pública `/menu/[slug]` en el frontend (Next.js, App Router), accesible sin login.
- La página consume `GET /api/menu/:slug`, agrupa los items por categoría y muestra nombre, descripción, precio e imagen de cada uno.
- Los items con `available = 0` (false) se ocultan de la vista pública.
- Si el slug no corresponde a ningún restaurante (404 del backend), se muestra una pantalla de error clara en vez de una página vacía o un crash.
- El diseño es mobile-first: se prioriza el layout y la legibilidad en pantallas de celular, ya que el acceso principal es escaneando un QR físico en la mesa.
- Se muestra un estado de carga mientras se obtiene el menú.

## Capabilities

### New Capabilities
- `public-menu-page`: vista pública (sin autenticación) del menú de un restaurante por slug, con agrupación por categoría, ocultamiento de no disponibles, manejo de error 404 y diseño mobile-first.

### Modified Capabilities
(ninguna — no se modifica ningún endpoint existente; el backend ya expone `GET /api/menu/:slug` sin cambios necesarios)

## Impact

- **Frontend** (`fuego/frontend`): nueva ruta `app/menu/[slug]/page.tsx`, posibles componentes nuevos (tarjeta de item, agrupador por categoría, estado de error/carga).
- **Backend**: sin cambios. `GET /api/menu/:slug` ya filtra correctamente por restaurante existente y devuelve 404 si no existe, pero hoy devuelve TODOS los items (incluidos no disponibles) — el filtrado de disponibilidad se resuelve en el frontend para este alcance (no se modifica el contrato del endpoint).
- **Sin impacto en autenticación**: esta vista es completamente pública, no interactúa con el flujo de admin-panel.
