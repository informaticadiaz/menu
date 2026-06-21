## 1. Formalizar `/system/login`

- [x] 1.1 Verificar que `fuego/frontend/app/system/login/page.tsx` use `system-shell`, `brand-card`, `brand-eyebrow`, `brand-title`, `brand-copy`, `field-group`, `field-label`, `field-input`, `notice-error`, `btn btn-primary` (ya aplicado en working tree) sin cambios visuales adicionales. Corregido: el eyebrow "Sistema" se revirtió a `text-stone-500` inline porque `brand-eyebrow` (vía `--brand`) renderizaba casi negro en vez del gris original.

## 2. Aplicar a `/system` (panel interno)

- [x] 2.1 Aplicar `system-shell`, `brand-title`, `brand-copy`, `field-input`, `btn`, `btn-secondary`, `btn-primary`, `btn-danger`, `notice-error` a `fuego/frontend/app/system/system-panel.tsx`. Se mantuvieron sin cambios el eyebrow "Sistema" (gris, no asociado a `--brand`), los contenedores `border-white/10` (no equivalentes a `brand-panel`) y los textos de slug/email (line-height de `brand-copy` difiere si el contenido wrappea), y los botones "Pausar"/"Reactivar" (colores ámbar/verde sin equivalente en el sistema, uso único).
- [x] 2.2 Mapeado el badge de estado: `badge-success` para `active`, nueva clase `badge-warning` (`#fffbeb`/`#b45309`, equivalente exacto a `amber-50`/`amber-700`) agregada en `globals.css` para `paused`.

## 3. Aplicar a `/signup`

- [x] 3.1 Aplicado `brand-card`, `brand-eyebrow`, `brand-title`, `brand-copy`, `field-group`, `field-label`, `field-input`, `notice-error`, `btn btn-primary` a `fuego/frontend/app/signup/page.tsx`. El cuadro informativo de slug usa `notice` (estructura) + `bg-stone-50 text-stone-600` (color, sin variante neutral existente); los errores por campo quedaron como `text-sm text-red-600` sin caja, ya que `notice-error` agrega fondo/padding que el original no tenía.

## 4. Aplicar a `/menu/[slug]`

- [x] 4.1 Aplicado `brand-eyebrow`, `brand-title`, `brand-card`, `brand-copy` a las secciones de encabezado y estado de error de `fuego/frontend/app/menu/[slug]/page.tsx`. El párrafo de error ("No pudimos cargar...") quedó sin `brand-copy` porque el original no tenía `text-sm` y heredarlo habría reducido el tamaño de fuente.

## 5. Verificación

- [x] 5.1 Ejecutar `npm run lint` en `fuego/frontend` para verificar que no haya errores.
- [x] 5.2 Ejecutar `npm run build` en `fuego/frontend` para verificar compilación.
- [x] 5.3 Revisado visualmente con Playwright: `/signup` y `/menu/[slug]` (slug real "fuego") sin diferencias respecto al estado anterior; `/system/login` y `/system` (login real con credenciales seed `system@fuego.local`) adoptando el tema claro.

## 6. Unificar `/system/login` y `/system` al tema claro

- [x] 6.1 Quitar `system-shell` y `bg-stone-950`/`text-white` de `fuego/frontend/app/system/login/page.tsx`; usar `brand-eyebrow` (ahora válido sin variante oscura) y la paleta naranja por defecto, igual que `/admin/login`.
- [x] 6.2 Quitar `system-shell`, `bg-stone-950`, `text-white` y `border-white/10` de `fuego/frontend/app/system/system-panel.tsx`; usar `brand-card` para los dos contenedores principales y `brand-eyebrow` para "Sistema".
- [x] 6.3 Eliminar la clase `.system-shell` de `fuego/frontend/app/globals.css` (sin uso tras 6.1/6.2).
- [x] 6.4 Revisado visualmente `/system/login` y `/system` (con login real) y confirmado que se ven consistentes con `/admin/login` y `/admin`.
