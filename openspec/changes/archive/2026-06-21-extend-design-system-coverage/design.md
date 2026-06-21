## Context

`codify-existing-design-system` ya define las clases reutilizables (`brand-*`, `field-*`, `btn-*`, `badge-*`, `notice-*`) en `fuego/frontend/app/globals.css` y las aplicó a `/`, `/admin/login` y `/admin`. Ese trabajo no toca `/system/login`, `/system` (`system-panel.tsx`), `/signup` ni `/menu/[slug]`. `/system/login` ya tiene las clases aplicadas en el working tree (incluyendo una clase `.system-shell` no documentada), pero las otras tres pantallas siguen con Tailwind repetido.

## Goals / Non-Goals

**Goals:**
- Aplicar las clases existentes del design system a las cuatro pantallas faltantes.
- Unificar `/system/login` y `/system` bajo el mismo tema claro/naranja que el resto de la app (decisión tomada durante la verificación visual: el panel interno no debía tener un tema propio).

**Non-Goals:**
- No se rediseña la estructura, layout ni copy de ninguna pantalla; solo cambia la paleta de `/system/login` y `/system` (oscuro → claro) y las clases usadas para implementarla.
- No se modifica `codify-existing-design-system` ni las pantallas que ese change tomó como referencia (`/`, `/admin/login`, `/admin`).
- No se crean clases nuevas salvo necesidad estricta (cubierto como riesgo abajo).

## Decisions

- **Eliminar `.system-shell` de `globals.css`** y migrar `/system/login` y `/system` a la paleta naranja por defecto, igual que `/admin/login` y `/admin`. La variante oscura no aportaba una distinción funcional (autenticación, permisos) y generaba una experiencia visualmente discontinua entre login y panel.
- **Aplicar clases sin alterar estructura JSX** más allá de reemplazar `className`, igual que el patrón usado en `codify-existing-design-system` (ver diff de `/admin/login`, `/admin`, `/`).
- **Los dos contenedores principales de `system-panel.tsx` usan `brand-card`** (no `brand-panel`): son los contenedores primarios de la pantalla, igual rol que el `brand-card` de `/admin/login`, así que adoptan su radio (1.5rem), borde (`stone-200`) y sombra (`shadow-sm`) en vez de los `border-white/10`/`shadow-xl` que tenían como ajuste específico del tema oscuro.

## Risks / Trade-offs

- [`system-panel.tsx` tiene un patrón de lista con badge de estado dinámico (`active`/`paused`) que ya tiene clases equivalentes (`badge-success`, `badge-muted`) pero el mapeo actual usa `green-50/amber-50` en vez de `green/amber`] → Usar `badge-success` para `active` y crear, si falta, una variante `badge-muted` con tono ámbar solo si `badge-muted` (gris) no es semánticamente correcta para "paused"; de ser necesaria una clase nueva, se documenta explícitamente en tasks.md antes de implementarla.
- [Migrar 4 pantallas a la vez puede introducir un cambio visual no intencional] → Cada tarea de aplicación debe verificarse contra un screenshot/comparación visual antes de marcarse como hecha, igual que el change anterior usó `npm run lint` y `npm run build` como verificación mínima.

## Migration Plan

No aplica rollback especial: son cambios de `className` en componentes existentes, reversibles con `git revert`. Se implementa pantalla por pantalla (4 tareas independientes) para poder revisar cada una por separado.
