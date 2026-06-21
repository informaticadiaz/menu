## Context

El sistema ya tiene `logo_url TEXT` y `description TEXT` en la tabla `restaurants`, pero ningún endpoint los gestiona ni los expone. El endpoint `/api/upload` para subir archivos ya existe y devuelve una URL relativa. El admin panel (`/admin`) ya tiene un `MenuItemForm` con carga de imagen para items — se puede usar ese patrón como referencia. El endpoint público `/api/menu/:slug` solo devuelve `restaurant_id` y `restaurant_name`, ignorando los campos de branding.

## Goals / Non-Goals

**Goals:**
- Exponer `logo_url` y `description` en `GET /api/menu/:slug` para que el frontend público los consuma.
- Nuevo `GET /api/admin/restaurant` — devuelve los datos del restaurante del admin autenticado.
- Nuevo `PUT /api/admin/restaurant` — actualiza `name`, `description`, `logo_url` del restaurante autenticado.
- UI en el panel admin para editar y previsualizar el branding.
- UI en la página pública `/menu/[slug]` que muestra logo y descripción si existen.

**Non-Goals:**
- Temas de color o tipografía personalizados.
- Múltiples logos o imágenes de portada.
- Gestión de dominio o subdominios.
- Migración de DB — los campos ya existen.

## Decisions

### 1. Endpoint admin para branding: PATCH vs PUT

Se usa `PUT /api/admin/restaurant` (reemplazo total de campos editables: `name`, `description`, `logo_url`). Los tres campos son opcionales en el body pero el handler actualiza solo los provistos.

**Alternativa descartada**: PATCH semántico con merge parcial — innecesario dado que son 3 campos planos; el form siempre envía el estado completo.

### 2. Logo: URL vs upload directo al endpoint de branding

El logo se sube primero a `POST /api/upload` (existente) y el frontend recibe la URL. Esa URL se envía en `PUT /api/admin/restaurant` como `logo_url`. No se cambia el flujo de upload.

**Alternativa descartada**: Endpoint de branding que acepta multipart — añade complejidad al handler sin beneficio real dado que el cliente ya conoce el flujo de upload.

### 3. Dónde mostrar el branding en el panel admin

Se agrega una sección "Datos del negocio" en `/admin/page.tsx` (o un componente `RestaurantBrandingForm` extraído), antes de la lista de items del menú. No se crea una ruta separada `/admin/settings` para mantener la simplicidad actual del panel.

### 4. Imagen en el menú público

Si `logo_url` existe, se muestra en el encabezado de la página antes de las categorías. Se usa `<img>` nativo con dominio relativo (el backend sirve `/uploads/*` estáticamente). Si no existe, no se muestra ningún espacio vacío.

## Risks / Trade-offs

- **Storage local**: Las imágenes se guardan en `uploads/` en disco. Si el server se reinicia o la instancia cambia, las imágenes se pierden. → Aceptable para el MVP; un siguiente paso sería object storage.
- **Sin validación de logo_url en PUT**: Un admin podría pasar cualquier URL externa. → Bajo riesgo por ahora; los admins son de confianza y el campo es libre.
- **name requerido**: Si el admin borra el nombre del restaurante en el form, el PUT fallaría. → El form debe tener validación client-side de nombre no vacío.

## Migration Plan

1. No hay migración de DB.
2. El nuevo campo `description` y `logo_url` en la respuesta de `GET /api/menu/:slug` es aditivo — no rompe clientes existentes.
3. Deploy: backend primero (nuevos endpoints), frontend después.
