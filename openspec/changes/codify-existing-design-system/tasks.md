## 1. Sistema de Tokens y Clases Globales

- [x] 1.1 Extraer variables CSS en `:root` dentro de `globals.css` para colores de fondo, texto, acento, bordes, radios y sombras, tomando los valores exactos del diseño actual (stone-50, stone-200, stone-300, stone-600, stone-800, stone-950, orange-700, orange-800, orange-600, red-50, red-700, green-50, green-700).
- [x] 1.2 Crear clases reutilizables en `globals.css` para panel (`brand-panel`), tarjeta principal (`brand-card`), eyebrow (`brand-eyebrow`), título (`brand-title`), texto descriptivo (`brand-copy`), grupos de campo (`field-group`, `field-label`, `field-input`), botones (`btn`, `btn-primary`, `btn-secondary`, `btn-danger`), badges (`badge`, `badge-success`, `badge-muted`) y mensajes (`notice`, `notice-error`), todas equivalentes a las clases Tailwind actuales.

## 2. Aplicación a Pantallas de Referencia

- [x] 2.1 Aplicar `brand-card`, `brand-eyebrow`, `brand-title`, `brand-copy`, `btn-primary`, `btn-secondary` a `/` (landing) sin cambiar apariencia visual.
- [x] 2.2 Aplicar `brand-card`, `brand-eyebrow`, `brand-title`, `brand-copy`, `field-group`, `field-label`, `field-input`, `notice-error`, `btn-primary` a `/admin/login` sin cambiar apariencia visual.
- [x] 2.3 Aplicar `brand-panel`, `brand-eyebrow`, `brand-title`, `brand-copy`, `btn-secondary`, `btn-danger`, `badge-success`, `badge-muted` a `/admin` (menu-panel.tsx) y `MenuItemForm.tsx` sin cambiar apariencia visual.

## 3. Verificación

- [x] 3.1 Ejecutar `npm run lint` en `fuego/frontend` para verificar que no haya errores.
- [x] 3.2 Ejecutar `npm run build` en `fuego/frontend` para verificar compilación.
