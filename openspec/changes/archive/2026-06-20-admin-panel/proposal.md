## Why

Hoy el menú de cada restaurante solo puede modificarse insertando filas directamente en la base de datos. Los endpoints de escritura (`POST/PUT/DELETE /api/menu-items`) están abiertos sin ningún control de acceso, y no existe ninguna interfaz para que el dueño del restaurante gestione su propio menú. Para que Fuego sea usable por un restaurante real, el dueño necesita poder loguearse y editar su menú (altas, bajas, modificaciones, disponibilidad, fotos) sin intervención técnica.

## What Changes

- Se agregan endpoints de autenticación en el backend: `POST /api/auth/login` (valida email/password contra `admin_users`, emite un JWT) y un middleware que protege las rutas de escritura del menú.
- **BREAKING**: `POST /api/menu-items`, `PUT /api/menu-items/:id` y `DELETE /api/menu-items/:id` dejan de ser públicos; ahora requieren un header `Authorization: Bearer <token>` válido y atado al `restaurant_id` del admin autenticado.
- Se agrega un endpoint `GET /api/menu-items/:id` y `GET /api/admin/menu` (lista completa del menú del restaurante del admin autenticado, incluyendo items no disponibles) para alimentar el panel.
- Se crea una vista de login (`/admin/login`) y un panel de administración (`/admin`) en el frontend (Next.js) con:
  - Listado de items del menú agrupados por categoría, con estado disponible/no disponible.
  - Formulario para crear y editar un item (nombre, categoría, descripción, precio, disponibilidad, imagen).
  - Subida de imagen usando el endpoint existente `POST /api/upload`.
  - Acción de eliminar un item con confirmación.
  - Cierre de sesión.
- El token de sesión se persiste en el cliente (cookie o localStorage) y las rutas de `/admin/*` redirigen a `/admin/login` si no hay sesión válida.

## Capabilities

### New Capabilities
- `admin-auth`: login de administradores de restaurante contra `admin_users`, emisión/validación de JWT, y protección de rutas de escritura del menú.
- `admin-menu-panel`: interfaz de administración (frontend) para que un admin autenticado gestione el menú de su restaurante (listar, crear, editar, eliminar, marcar disponibilidad, subir imagen).

### Modified Capabilities
(ninguna — no existen specs previas en el repo)

## Impact

- **Backend** (`fuego/backend/src`): nuevo middleware de auth, nuevos endpoints (`/api/auth/login`, `/api/admin/menu`, `/api/menu-items/:id` GET), cambio de comportamiento (ahora requieren auth) en los endpoints de escritura existentes de `menu-items`. Nueva dependencia: librería de JWT (`jsonwebtoken`) y hash de password (`bcrypt` o `argon2`) para `admin_users.password_hash`.
- **Frontend** (`fuego/frontend`): nuevas rutas `/admin/login` y `/admin`, cliente HTTP que adjunta el token a los requests protegidos, manejo de sesión (guardar/leer/borrar token).
- **Base de datos**: no requiere cambios de schema (`admin_users` ya existe); sí requiere un proceso para crear el primer admin (seed o endpoint de registro, a decidir en design.md).
