## Why

El change `codify-existing-design-system` extrajo el lenguaje visual de `/`, `/admin/login` y `/admin` a clases reutilizables en `globals.css` (`brand-*`, `field-*`, `btn-*`, `badge-*`, `notice-*`), pero su alcance fue intencionalmente acotado a esas tres pantallas. El resto de la app quedó afuera: `/system/login` recibió las clases nuevas de forma ad-hoc (sin spec ni tasks que lo respalden), y `/system` (`system-panel.tsx`), `/signup` y `/menu/[slug]` siguen con Tailwind repetido sin pasar por el sistema. Esto reproduce el problema original (estilos implícitos, inconsistentes) en las pantallas que faltan.

## What Changes

- Unificar `/system/login` y `/system` (`system-panel.tsx`) bajo el mismo canon claro/naranja que el resto de la app, eliminando la variante oscura `.system-shell`. El panel interno dejaba de verse coherente con el resto del producto sin aportar una razón funcional; se decidió no mantener un segundo tema.
- Aplicar las clases existentes del design system (`brand-card`, `brand-eyebrow`, `brand-title`, `brand-copy`, `field-group`, `field-label`, `field-input`, `btn`, `btn-primary`, `btn-secondary`, `btn-danger`, `badge-success`, `badge-warning`, `notice-error`) a `fuego/frontend/app/system/login/page.tsx` y `fuego/frontend/app/system/system-panel.tsx` con la paleta naranja por defecto (sin `.system-shell`).
- Eliminar la clase `.system-shell` de `globals.css` (queda sin uso tras este cambio).
- Aplicar las clases existentes del design system a `fuego/frontend/app/signup/page.tsx` y a `fuego/frontend/app/menu/[slug]/page.tsx`.
- No crear clases nuevas salvo que una pantalla necesite un patrón visual que no exista todavía en `globals.css`; en ese caso, documentarlo explícitamente antes de implementarlo.
- No alterar comportamiento funcional ni copy visible de ninguna de las cuatro pantallas. La apariencia visual de `/system/login` y `/system` cambia deliberadamente (de oscuro a claro); las otras dos pantallas mantienen su apariencia.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `design-system-guidelines`: extiende el canon de pantallas cubiertas más allá de `/`, `/admin/login` y `/admin` para incluir `/system/login`, `/system` (panel interno), `/signup` y `/menu/[slug]`, todas bajo la misma paleta naranja/clara. No existe variante oscura en el canon.

## Impact

- Código: `fuego/frontend/app/system/login/page.tsx`, `fuego/frontend/app/system/system-panel.tsx` (cambio visual deliberado: oscuro → claro), `fuego/frontend/app/signup/page.tsx`, `fuego/frontend/app/menu/[slug]/page.tsx`.
- `fuego/frontend/app/globals.css`: se agrega `badge-warning` y se elimina `.system-shell`.
- No cambia APIs, backend, autenticación, base de datos ni flujos funcionales.
- No incorpora nuevas dependencias, librerías UI, icon packs ni fuentes.
- No modifica `codify-existing-design-system` ni las pantallas que ese change tomó como referencia.
