## Why

El branding actual de cada negocio (logo, nombre, descripción) no incluye personalización de color: el menú público (`/menu/[slug]`) y el panel admin (`/admin`) usan siempre la misma paleta naranja/clara fija de Fuego. Para un SaaS de menús, poder reflejar la identidad de marca del negocio (colores) es una de las propuestas de valor más visibles y fáciles de monetizar. Hoy esa diferenciación no existe.

## What Changes

- Catálogo fijo de 6-8 paletas de colores predefinidas (ej: clásico oscuro, cálido/terracota, minimal claro, verde natural, elegante negro/dorado, vibrante), cada una con colores `primary`, `secondary`, `background` y `accent`.
- Nuevo campo `palette_id` en `restaurants`, persistido vía los endpoints existentes `GET/PUT /api/admin/restaurant`.
- El panel admin (`/admin`) agrega un selector visual de paleta (grilla de swatches) dentro de la sección de branding existente.
- La paleta seleccionada se aplica como tema visual tanto en `/menu/[slug]` (encabezado, categorías, acentos, botones) como en `/admin` del propio negocio (header y acentos del panel, no en `/system` ni en pantallas de Fuego como `/`, `/admin/login`, `/signup`).
- Se modifica la regla `design-system-guidelines` para declarar una excepción explícita: las pantallas tenant-facing (`/menu/[slug]` y `/admin` autenticado de un negocio) pueden variar de paleta según el negocio; las pantallas propias de Fuego (`/`, `/admin/login`, `/system/login`, `/system`, `/signup`) mantienen el canon naranja fijo sin excepción.

## Capabilities

### New Capabilities

- `color-palette-catalog`: Catálogo fijo de paletas predefinidas, expuesto al frontend para selección y renderizado de temas.

### Modified Capabilities

- `restaurant-branding-settings`: Agrega `palette_id` a la lectura/escritura de branding y un selector de paleta en la UI del admin.
- `public-menu-page`: El menú público aplica la paleta del negocio como tema visual (colores de fondo, acentos, botones).
- `design-system-guidelines`: Se agrega una excepción explícita para theming tenant-facing en `/menu/[slug]` y `/admin` de negocio, sin afectar las pantallas propias de Fuego.

## Impact

- **Backend**: nuevo catálogo de paletas (constante en código, no requiere tabla propia); columna `palette_id` en `restaurants` (migración aditiva); `GET/PUT /api/admin/restaurant` y `GET /api/menu/:slug` exponen `palette_id`.
- **Frontend**: selector de paleta en el panel admin; theming dinámico (CSS variables) en `/menu/[slug]` y en el layout de `/admin` autenticado según `palette_id`.
- **DB**: migración aditiva — `ALTER TABLE restaurants ADD COLUMN palette_id TEXT DEFAULT 'classic-dark'` (o paleta default a elegir).
- **Design system**: actualización del spec `design-system-guidelines` para documentar la excepción tenant-facing.
