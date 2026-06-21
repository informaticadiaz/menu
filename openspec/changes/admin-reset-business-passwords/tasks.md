## 1. Backend

- [x] 1.1 Agregar `POST /api/system/restaurants/:id/reset-password` protegido con `systemAuthMiddleware`.
- [x] 1.2 Validar que el body incluya `password`; responder 400 sin modificar datos si falta.
- [x] 1.3 Buscar el admin por `restaurant_id`; responder 404 si no existe el negocio/admin asociado.
- [x] 1.4 Hashear la nueva contraseña con bcrypt y actualizar `admin_users.password_hash` sin devolver contraseña ni hash.

## 2. UI del panel interno

- [x] 2.1 Agregar acción de restablecer contraseña por negocio en `fuego/frontend/app/system/system-panel.tsx`.
- [x] 2.2 Solicitar la nueva contraseña de forma explícita antes de llamar al endpoint.
- [x] 2.3 Mostrar éxito/error de la operación y limpiar la contraseña ingresada al finalizar.

## 3. Verificación

- [x] 3.1 Verificar que el endpoint rechace requests sin sesión interna.
- [x] 3.2 Verificar que la contraseña anterior deje de autenticar y la nueva contraseña autentique por `/api/auth/login`.
- [x] 3.3 Ejecutar los checks disponibles de backend/frontend relevantes para el cambio.

## 4. Modal de datos para WhatsApp

- [x] 4.1 Mostrar un modal después de restablecer contraseña con URL de login, email del admin y nueva contraseña.
- [x] 4.2 Agregar acción para copiar un mensaje listo para enviar por WhatsApp.
- [x] 4.3 Limpiar la nueva contraseña del estado al cerrar el modal.
- [x] 4.4 Ejecutar verificación frontend relevante.
