## Why

Los negocios no tienen forma de personalizar la apariencia de su menú público: no pueden subir un logo ni agregar una descripción. La tabla `restaurants` ya tiene los campos `logo_url` y `description` en el schema, pero ningún endpoint los expone ni la UI los gestiona, por lo que es dead code no utilizado.

## What Changes

- Nuevo endpoint `PUT /api/admin/restaurant` para que el admin actualice el branding de su negocio (nombre, descripción, logo).
- Nuevo endpoint `GET /api/admin/restaurant` para que el admin lea los datos actuales de su negocio.
- El endpoint público `GET /api/menu/:slug` devuelve `logo_url` y `description` además de los datos actuales.
- La página pública `/menu/[slug]` muestra el logo del negocio (si existe) y la descripción.
- El panel admin `/admin` incluye una sección de "Datos del negocio" para editar nombre, descripción y logo.

## Capabilities

### New Capabilities

- `restaurant-branding-settings`: Permite al admin autenticado leer y actualizar los datos de su negocio (nombre, descripción, logo_url) vía API, y gestionar el logo mediante la carga de imagen existente (`/api/upload`).

### Modified Capabilities

- `public-menu-page`: La vista pública del menú incorpora el logo y la descripción del negocio en el encabezado de la página.

## Impact

- **Backend**: nuevo handler `GET /api/admin/restaurant` y `PUT /api/admin/restaurant`; modificar `GET /api/menu/:slug` para incluir `logo_url` y `description`.
- **Frontend**: sección de branding en `admin/page.tsx` o panel dedicado; actualizar `app/menu/[slug]/page.tsx` y sus componentes para mostrar logo y descripción.
- **DB**: sin migraciones — `logo_url` y `description` ya existen en `restaurants`.
- **Upload**: reutiliza el endpoint existente `POST /api/upload`.
