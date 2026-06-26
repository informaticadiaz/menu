## Context

El admin autenticado ya conoce el `slug` de su negocio (`GET /api/admin/restaurant`, consumido en `admin/page.tsx` y pasado a `RestaurantBrandingForm`). El frontend sirve tanto el panel admin como `/menu/[slug]` desde el mismo origen (`next.config.ts` solo reescribe `/api/*` y `/uploads/*` hacia el backend; no hay un dominio público separado documentado). No existe hoy ninguna dependencia de generación de imágenes/QR en el proyecto.

## Goals / Non-Goals

**Goals:**
- Generar el QR de `/menu/[slug]` enteramente en el navegador del admin, sin nuevo endpoint de backend.
- Permitir descargar el QR como PNG (para compartir/imprimir directo) y como SVG (para impresión de alta calidad sin pixelado).
- Mostrar la URL en texto plano con copiado a portapapeles, como respaldo si el QR no se puede escanear.

**Non-Goals:**
- Personalizar el QR con logo/colores del negocio.
- Analytics de escaneos (cuántas veces se escaneó el QR) — queda para una propuesta de analytics aparte.
- Generación server-side o cacheo del QR en el backend.

## Decisions

### 1. URL codificada: `window.location.origin` vs. variable de entorno nueva

Se usa `window.location.origin + '/menu/' + slug` calculado en el cliente, en vez de introducir un `NEXT_PUBLIC_SITE_URL` nuevo. El admin siempre accede a `/admin` desde el mismo origen que sirve `/menu/[slug]` (es el mismo frontend Next.js); no hay un dominio público distinto documentado en `.env.example`. Evita una variable de configuración adicional que podría quedar desincronizada en producción.

**Alternativa descartada**: nueva env var `NEXT_PUBLIC_SITE_URL`. Se descarta porque añade un punto de configuración manual sin necesidad real hoy; se puede introducir después si el dominio del panel admin y el del menú público llegan a divergir.

### 2. Librería de generación de QR

Se agrega `qrcode` (paquete npm, sin dependencias nativas, soporta `toDataURL` para PNG y `toString({ type: 'svg' })` para SVG) como dependencia del frontend. Corre tanto en cliente como en servidor, pero acá se usa solo client-side dentro de un componente `'use client'`.

**Alternativa descartada**: `qrcode.react` — es un wrapper de componente React sobre una implementación similar; no ofrece ventaja sobre usar `qrcode` directamente y agregar una dependencia extra para envolver algo simple no se justifica.

### 3. Dónde vive el componente

Se crea `app/admin/components/MenuQrCode.tsx`, integrado en `app/admin/page.tsx` después de `RestaurantBrandingForm` y antes de `MenuPanel`, siguiendo el mismo patrón de sección que ya usa branding (recibe `slug` como prop, no hace fetch propio).

**Alternativa descartada**: ruta separada `/admin/qr`. Se descarta para mantener la simplicidad actual del panel (una sola pantalla con secciones), igual que se decidió para branding en la propuesta `business-branding-customization`.

### 4. Formato de descarga

El PNG se genera con `QRCode.toDataURL(url, { width: 512, margin: 2 })` y se descarga vía un `<a download>` apuntando al data URL — no requiere subir nada a `/api/upload` ni tocar el backend. El SVG se genera con `QRCode.toString(url, { type: 'svg', width: 512, margin: 2 })` y se descarga como `Blob` con `URL.createObjectURL`.

## Risks / Trade-offs

- **Dependencia nueva en el frontend**: `qrcode` agrega peso al bundle del admin. → Aceptable; el componente y la librería solo se cargan en `/admin`, no afectan el bundle de `/menu/[slug]` ni de la landing.
- **`window.location.origin` asume mismo dominio para admin y menú público**: si en el futuro se separan (ej. subdominios distintos por negocio), el QR generado apuntaría al dominio del panel admin en vez del dominio público correcto. → Riesgo aceptado y documentado; revisar si se introduce un dominio público distinto.
- **Sin validación de que el negocio esté `active`**: si un negocio está `paused`, el QR generado sigue apuntando a una URL que hoy devuelve igual el menú (el estado `paused` no bloquea `/menu/[slug]` actualmente, según lo implementado). → Fuera de alcance de esta propuesta; es comportamiento ya existente de `public-menu-page`.

## Migration Plan

1. Sin migración de DB ni cambios de backend.
2. Agregar `qrcode` al frontend, crear el componente, integrarlo en `/admin`.
3. Deploy: solo frontend, sin coordinación con el backend.
