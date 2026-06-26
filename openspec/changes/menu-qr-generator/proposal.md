## Why

El copy de la landing ya promete "Tu menú digital listo para compartir por QR", pero hoy no existe ninguna forma de obtener ese QR: un dueño de negocio que quiere imprimirlo para la mesa tiene que generarlo a mano con una herramienta externa y pegar la URL de `/menu/[slug]` él mismo. Es la idea de roadmap marcada como "gancho de venta rápido, bajo costo, alto impacto" y no depende de ninguna otra propuesta pendiente.

## What Changes

- El panel admin (`/admin`) incluye una sección "QR de tu menú" que genera, en el navegador, el código QR de la URL pública `/menu/[slug]` del negocio autenticado.
- El QR se puede descargar como imagen PNG y como SVG, listos para imprimir.
- La URL codificada se muestra como texto junto al QR, con un botón para copiarla al portapapeles.
- La generación es 100% client-side: no se agrega ningún endpoint de backend ni se persiste nada en la base de datos.

## Capabilities

### New Capabilities
- `menu-qr-generator`: generación y descarga (PNG/SVG) en el panel admin de un código QR que apunta a la URL pública del menú del negocio autenticado.

### Modified Capabilities
(ninguna — no se modifica ningún endpoint existente; el slug ya es conocido por el admin autenticado vía `GET /api/admin/restaurant`)

## Impact

- **Frontend** (`fuego/frontend`): nuevo componente en `app/admin/components/`, integrado en `app/admin/page.tsx` (o `menu-panel.tsx`) cerca de los datos de branding. Nueva dependencia de generación de QR (librería ligera, sin dependencias nativas).
- **Backend**: sin cambios.
- **Sin impacto en autenticación ni en el menú público**: la URL que se codifica es la misma que ya consume `/menu/[slug]`, no se modifica esa vista.
