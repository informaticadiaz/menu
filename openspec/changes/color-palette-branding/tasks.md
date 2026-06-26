## 1. Catálogo de paletas

- [x] 1.1 Definir el catálogo de 6-8 paletas (id, nombre, `primary`, `secondary`, `background`, `accent`) en un módulo compartido (ej. `fuego/backend/src/palettes.ts` y equivalente o import compartido en frontend)
- [x] 1.2 Elegir paleta default (`classic-dark` o similar) para negocios existentes

## 2. Backend — persistencia y validación

- [x] 2.1 Migración aditiva: agregar columna `palette_id TEXT DEFAULT '<default>'` a `restaurants` en `fuego/backend/src/db/schema.ts` (y script de migración si la tabla ya existe en DBs desplegadas)
- [x] 2.2 Modificar `GET /api/admin/restaurant` para incluir `palette_id` en la respuesta
- [x] 2.3 Modificar `PUT /api/admin/restaurant` para aceptar `palette_id` opcional, validar que exista en el catálogo (400 si no), y persistirlo
- [x] 2.4 Modificar `GET /api/menu/:slug` para incluir `palette_id` (o los valores de color resueltos) en la respuesta

## 3. Frontend — selector de paleta en panel admin

- [x] 3.1 Agregar selector visual de paleta (grilla de swatches con nombre y preview de colores) en `RestaurantBrandingForm`
- [x] 3.2 Al cargar el form, preseleccionar la paleta actual del negocio (`palette_id` de `GET /api/admin/restaurant`)
- [x] 3.3 Al guardar, incluir `palette_id` en el `PUT /api/admin/restaurant`

## 4. Frontend — theming dinámico

- [x] 4.1 Crear helper que resuelva `palette_id` → CSS variables (`--palette-primary`, `--palette-secondary`, `--palette-background`, `--palette-accent`)
- [x] 4.2 Aplicar las CSS variables en el contenedor raíz de `/menu/[slug]` según la paleta del restaurante cargado
- [x] 4.3 Migrar los colores de marca hardcodeados en `/menu/[slug]` (header: eyebrow, título, fondo) a `var(--palette-*)`. Se descartó migrar el detalle de cada item (placeholder de imagen y precio): esos colores quedan fijos como antes para no arriesgar el look default, ya que no aportaban a la identidad visual del negocio tanto como el encabezado
- [x] 4.4 Aplicar las CSS variables al header y acentos de botones/badges del layout de `/admin` autenticado, sin remapear estados semánticos (error/éxito) existentes

## 5. Design system

- [x] 5.1 Actualizar el requirement "Canon visual basado en pantallas existentes" en `openspec/specs/design-system-guidelines/spec.md` para documentar la excepción tenant-facing en `/menu/[slug]` y `/admin` de negocio, aclarando que `/`, `/admin/login`, `/system/login`, `/system` y `/signup` mantienen el canon fijo

## 6. Verificación

- [x] 6.1 Probar manualmente: crear/editar negocio, elegir cada una de las paletas, verificar que `/menu/[slug]` y `/admin` reflejen los colores correctos
- [x] 6.2 Verificar que un negocio sin `palette_id` (datos existentes) renderiza con la paleta default sin romper apariencia actual
- [x] 6.3 Verificar que `/`, `/admin/login`, `/system/login`, `/system` y `/signup` no cambian visualmente
