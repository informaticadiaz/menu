## Context

`restaurants` ya tiene `logo_url` y `description`, gestionados vía `GET/PUT /api/admin/restaurant` (ver `backend/src/index.ts:128-170`) y expuestos en `GET /api/menu/:slug` (`backend/src/index.ts:394-402`). El frontend tiene un `RestaurantBrandingForm` en el panel admin y una página pública `/menu/[slug]` que ya muestra logo y descripción. El spec `design-system-guidelines` establece que todas las pantallas (incluyendo `/menu/[slug]` y `/admin`) usan una única paleta naranja, sin variantes — esta propuesta crea una excepción explícita para esas dos pantallas cuando se renderiza contenido de un negocio específico.

## Goals / Non-Goals

**Goals:**
- Catálogo fijo de 6-8 paletas predefinidas, definidas en código (no editables por el negocio más allá de elegir una).
- Selección de paleta integrada al flujo de branding existente (mismo form, mismo endpoint).
- Theming dinámico vía CSS variables, aplicado a `/menu/[slug]` y al `/admin` autenticado de un negocio.
- Excepción documentada en `design-system-guidelines` que preserva el canon fijo en pantallas propias de Fuego.

**Non-Goals:**
- Color picker libre / paletas custom por negocio.
- Paletas segmentadas por rubro.
- Personalización de tipografía.
- Cambiar el canon visual de `/`, `/admin/login`, `/system/login`, `/system`, `/signup`.

## Decisions

### 1. Catálogo de paletas: constante en código vs tabla en DB

El catálogo vive como constante en código compartido (ej. `shared/palettes.ts` o equivalente en backend y frontend), no en una tabla. Son 6-8 valores fijos que solo el equipo de Fuego modifica; no hay caso de uso para que un negocio cree paletas propias en esta iteración.

**Alternativa descartada**: tabla `palettes` en DB — agrega complejidad de gestión sin beneficio, ya que el catálogo no es editable por usuarios.

### 2. Persistencia: `palette_id` como TEXT con clave del catálogo

`restaurants.palette_id TEXT DEFAULT 'classic-dark'`. El backend valida que el `palette_id` recibido en `PUT /api/admin/restaurant` exista en el catálogo; si no, responde 400.

**Alternativa descartada**: guardar los valores de color directamente en la fila — pierde la ventaja de catálogo curado y dificulta actualizar una paleta para todos los negocios que la usan.

### 3. Theming: CSS variables vs clases Tailwind condicionales

Cada paleta define un set fijo de CSS variables (`--palette-primary`, `--palette-secondary`, `--palette-background`, `--palette-accent`). `/menu/[slug]` y el layout de `/admin` autenticado inyectan estas variables en un `<style>` inline o atributo `style` en el contenedor raíz, según el `palette_id` del negocio cargado. Los componentes existentes migran sus colores hardcodeados de marca a `var(--palette-*)` donde aplica.

**Alternativa descartada**: generar clases Tailwind dinámicas por paleta — Tailwind no soporta bien clases generadas en runtime sin purgar/safelist manual; las CSS variables son más simples y no requieren cambios de build.

### 4. Alcance del theming en `/admin`: header y acentos, no todo el panel

En el `/admin` autenticado de un negocio, la paleta tiñe el header del panel y los acentos de botones primarios/badges de disponibilidad, reforzando la marca sin reconstruir todo el panel. Los controles funcionales (focus rings, errores, inputs) mantienen sus estados semánticos actuales (rojo error, verde éxito) sin remapear a la paleta, para no comprometer la legibilidad de estados.

**Alternativa descartada**: reteo completo del panel admin — mayor riesgo de romper contraste/legibilidad en estados semánticos; fuera de alcance para esta iteración.

### 5. Excepción en `design-system-guidelines`

Se modifica el requirement "Canon visual basado en pantallas existentes" para aclarar que `/menu/[slug]` y `/admin` autenticado de un negocio aplican la paleta del negocio (tenant-facing theming) como excepción explícita, mientras que `/`, `/admin/login`, `/system/login`, `/system` y `/signup` permanecen con el canon naranja fijo sin excepción.

## Risks / Trade-offs

- **Legibilidad de paletas mal combinadas con contenido dinámico**: aunque las paletas son curadas, combinaciones de texto/imagen de negocio podrían generar bajo contraste. → Mitigado al curar solo 6-8 paletas con contraste verificado manualmente; no hay color libre.
- **Migración aditiva con default**: negocios existentes sin `palette_id` quedan con la paleta default (`classic-dark` o la que se defina), preservando la apariencia naranja actual hasta que el negocio elija explícitamente.
- **Inconsistencia visual entre `/admin` y pantallas de Fuego**: un admin que viene de `/admin/login` (naranja) entra a `/admin` (paleta de su negocio) — cambio de color intencional, se documenta en el design system para que no se interprete como bug.

## Migration Plan

1. Migración aditiva: `ALTER TABLE restaurants ADD COLUMN palette_id TEXT DEFAULT 'classic-dark'`.
2. Backend: agregar catálogo de paletas, exponer `palette_id` en `GET/PUT /api/admin/restaurant` y `GET /api/menu/:slug`, validar `palette_id` contra catálogo en el PUT.
3. Frontend: selector de paleta en `RestaurantBrandingForm`; theming dinámico en `/menu/[slug]` y layout de `/admin`.
4. Deploy backend antes que frontend (igual que en branding anterior).
