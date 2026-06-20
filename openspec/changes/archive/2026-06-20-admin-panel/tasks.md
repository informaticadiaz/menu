## 1. Backend: dependencias y configuración

- [x] 1.1 Agregar `jsonwebtoken` y `bcryptjs` (+ tipos) a `fuego/backend/package.json`
- [x] 1.2 Agregar `JWT_SECRET` a `fuego/.env.example` con comentario indicando que es obligatorio en producción
- [x] 1.3 Leer `JWT_SECRET` desde `process.env` en el backend, con un valor de desarrollo por defecto solo si `NODE_ENV !== 'production'`

## 2. Backend: autenticación

- [x] 2.1 Crear `fuego/backend/src/middleware/auth.ts` con una función que verifique el JWT del header `Authorization`, devuelva 401 si falta o es inválido, y guarde `{ adminId, restaurantId }` en el contexto de Hono
- [x] 2.2 Implementar `POST /api/auth/login`: buscar `admin_users` por email, comparar password con `bcrypt.compare`, devolver 401 genérico si no coincide, o un JWT (payload `{ adminId, restaurantId }`, expiración 7d) si coincide
- [x] 2.3 Validar campos requeridos (`email`, `password`) en `/api/auth/login` devolviendo 400 si faltan

## 3. Backend: proteger y extender endpoints de menú

- [x] 3.1 Aplicar el middleware de auth a `POST /api/menu-items`, `PUT /api/menu-items/:id`, `DELETE /api/menu-items/:id`
- [x] 3.2 En `PUT` y `DELETE`, verificar que el `restaurant_id` del item coincida con el del token autenticado; devolver 403 si no coincide
- [x] 3.3 En `POST /api/menu-items`, ignorar cualquier `restaurant_id` del body y usar siempre el del token autenticado
- [x] 3.4 Agregar `available` a `allowedFields` en `PUT /api/menu-items/:id` para poder alternar disponibilidad
- [x] 3.5 Agregar `GET /api/menu-items/:id` (público, sin auth, para reusar en el formulario de edición si se necesita)
- [x] 3.6 Agregar `GET /api/admin/menu` protegido por el middleware, que devuelve todos los items (disponibles y no) del `restaurant_id` del token

## 4. Backend: seed del primer admin

- [x] 4.1 Extender `fuego/backend/src/db/init.ts` (`seedDatabase`) para crear un admin de ejemplo en `admin_users` (email fijo, password hasheada con bcrypt) atado al restaurante semilla `fuego-ba`
- [x] 4.2 Imprimir en consola las credenciales de ejemplo generadas al correr `npm run seed`, para facilitar pruebas locales

## 5. Frontend: cliente de API y sesión

- [x] 5.1 Crear un helper de cliente HTTP (`fuego/frontend/lib/api.ts`) que centralice la URL base (`NEXT_PUBLIC_API_URL`) y adjunte el header `Authorization` cuando haya token
- [x] 5.2 Crear un helper de sesión (`fuego/frontend/lib/session.ts`) para guardar/leer/borrar el token en `localStorage`
- [x] 5.3 Crear un layout o wrapper para las rutas `/admin/*` que redirija a `/admin/login` si no hay token, o si una llamada al backend devuelve 401

## 6. Frontend: login

- [x] 6.1 Crear página `fuego/frontend/app/admin/login/page.tsx` con formulario de email y password
- [x] 6.2 Al enviar, llamar a `POST /api/auth/login`; en éxito, guardar el token y navegar a `/admin`; en error, mostrar el mensaje devuelto por el backend

## 7. Frontend: panel de administración

- [x] 7.1 Crear página `fuego/frontend/app/admin/page.tsx` que llame a `GET /api/admin/menu` y muestre los items agrupados por categoría con su estado de disponibilidad
- [x] 7.2 Agregar un control por item para alternar disponibilidad (llama a `PUT /api/menu-items/:id` solo con el campo `available`)
- [x] 7.3 Crear formulario de alta/edición de item (nombre, categoría, descripción, precio, disponibilidad) reutilizable para crear y editar
- [x] 7.4 Integrar subida de imagen en el formulario: enviar el archivo a `POST /api/upload`, guardar la URL devuelta en `image_url` antes de crear/editar el item
- [x] 7.5 Agregar acción de eliminar item con diálogo de confirmación, llamando a `DELETE /api/menu-items/:id`
- [x] 7.6 Agregar botón de "Cerrar sesión" que borre el token y redirija a `/admin/login`

## 8. Verificación

- [x] 8.1 Probar manualmente el flujo completo: seed → login → crear item con imagen → editar → alternar disponibilidad → eliminar → logout
- [x] 8.2 Verificar que los endpoints de escritura del menú rechazan requests sin token (401) y con token de otro restaurante (403)
- [x] 8.3 Correr `npm run build` en backend y frontend para confirmar que compilan sin errores
