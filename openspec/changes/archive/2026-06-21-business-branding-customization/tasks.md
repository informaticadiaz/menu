## 1. Backend — nuevos endpoints admin

- [x] 1.1 Agregar handler `GET /api/admin/restaurant` en `fuego/backend/src/index.ts` que devuelva `id, name, slug, description, logo_url, status` del restaurante del admin autenticado
- [x] 1.2 Agregar handler `PUT /api/admin/restaurant` en `fuego/backend/src/index.ts` que acepte `name`, `description` y `logo_url` opcionales, valide que `name` no sea vacío si se provee, y actualice el registro con `updated_at`

## 2. Backend — exponer branding en menú público

- [x] 2.1 Modificar `GET /api/menu/:slug` para incluir `logo_url` y `description` en la respuesta del restaurante

## 3. Frontend — panel admin, sección branding

- [x] 3.1 Crear componente `RestaurantBrandingForm` en `fuego/frontend/app/admin/components/` que muestre inputs para nombre, descripción y logo (con previsualización)
- [x] 3.2 Llamar a `GET /api/admin/restaurant` al cargar el panel admin para poblar el form con los datos actuales
- [x] 3.3 Implementar lógica de carga de logo: al seleccionar imagen, subir vía `POST /api/upload` y guardar la URL resultante en el estado del form
- [x] 3.4 Al hacer submit del form, llamar a `PUT /api/admin/restaurant` con los datos y mostrar feedback de éxito o error
- [x] 3.5 Integrar `RestaurantBrandingForm` en `fuego/frontend/app/admin/page.tsx` o `menu-panel.tsx`

## 4. Frontend — menú público con branding

- [x] 4.1 Actualizar el tipo/interfaz del restaurant en `fuego/frontend/app/menu/[slug]/page.tsx` para incluir `logo_url` y `description`
- [x] 4.2 Mostrar el logo del negocio en el encabezado de la página `/menu/[slug]` cuando `logo_url` exista (sin espacio vacío si no existe)
- [x] 4.3 Mostrar la descripción del negocio debajo del nombre en el encabezado cuando `description` exista
