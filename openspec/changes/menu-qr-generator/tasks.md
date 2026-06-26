## 1. Frontend: dependencia

- [ ] 1.1 Agregar `qrcode` y `@types/qrcode` a `fuego/frontend/package.json`

## 2. Frontend: componente de QR

- [ ] 2.1 Crear `fuego/frontend/app/admin/components/MenuQrCode.tsx` (`'use client'`), recibe `slug: string` como prop
- [ ] 2.2 Calcular la URL pública como `${window.location.origin}/menu/${slug}` dentro de un `useEffect` (no disponible en SSR)
- [ ] 2.3 Generar el PNG con `QRCode.toDataURL(url, { width: 512, margin: 2 })` y mostrarlo en un `<img>`
- [ ] 2.4 Agregar botón "Descargar PNG" que descarga el data URL generado vía un `<a download>`
- [ ] 2.5 Agregar botón "Descargar SVG" que genera el SVG con `QRCode.toString(url, { type: 'svg', width: 512, margin: 2 })` y lo descarga como Blob
- [ ] 2.6 Mostrar la URL en texto plano con un botón "Copiar" que use `navigator.clipboard.writeText`
- [ ] 2.7 Manejar el estado de carga mientras se genera el QR (placeholder mientras `window` no está disponible / la promesa no resolvió)

## 3. Frontend: integración en el panel admin

- [ ] 3.1 Integrar `MenuQrCode` en `fuego/frontend/app/admin/page.tsx`, pasándole `restaurant.slug`, ubicado después de `RestaurantBrandingForm` y antes de `MenuPanel`

## 4. Verificación

- [ ] 4.1 Probar manualmente en `/admin`: el QR generado, al escanearse (o decodificarse), apunta a la URL correcta de `/menu/[slug]` del negocio logueado
- [ ] 4.2 Probar la descarga de PNG y de SVG y confirmar que ambos archivos abren correctamente
- [ ] 4.3 Probar el botón "Copiar" y confirmar que la URL copiada es la correcta
- [ ] 4.4 Correr `npm run build` en el frontend para confirmar que compila sin errores
