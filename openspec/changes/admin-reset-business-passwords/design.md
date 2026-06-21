## Context

El panel interno ya autentica administradores del sistema con `fuego_system_session` y expone acciones de gestión de negocios bajo `/api/system/restaurants`. Cada negocio tiene un único admin asociado en `admin_users`, ligado por `restaurant_id UNIQUE`, y el login del negocio verifica `password_hash` con bcrypt.

## Goals / Non-Goals

**Goals:**

- Permitir que un administrador interno restablezca la contraseña del admin de un negocio existente.
- Actualizar solo el hash de contraseña en `admin_users` usando bcrypt.
- Exponer la acción en la lista actual de negocios del panel `/system`.
- Mantener mensajes de error claros para negocio inexistente o negocio sin admin asociado.

**Non-Goals:**

- No implementar recuperación self-service por email.
- No generar ni enviar contraseñas por correo.
- No invalidar sesiones activas del admin de negocio, porque actualmente no existe almacenamiento server-side de sesiones/JWT emitidos.
- No agregar historial/auditoría de cambios de contraseña en esta iteración.

## Decisions

- Usar `POST /api/system/restaurants/:id/reset-password` protegido por `systemAuthMiddleware`.
  Alternativa considerada: crear un recurso bajo `/api/system/admin-users/:id/password`. Se descarta porque la UI y las acciones internas actuales operan por negocio, y el admin de negocio es único por `restaurant_id`.

- Recibir `{ password }` en el body y aplicar `bcrypt.hash(password, 10)` antes de actualizar `admin_users.password_hash`.
  Alternativa considerada: aceptar un hash ya calculado por cliente. Se descarta para no mover lógica sensible al frontend ni depender de implementación cliente.

- Resolver el admin por `restaurant_id` y responder 404 si no existe restaurante o no existe admin asociado.
  Alternativa considerada: crear un admin si falta. Se descarta porque sería una capacidad distinta a restablecer contraseña y requiere definir email/identidad.

- En la UI, solicitar la nueva contraseña mediante un control explícito antes de llamar al endpoint.
  Alternativa considerada: generar una contraseña aleatoria automáticamente. Se descarta porque requeriría definir reglas de entrega segura de la contraseña al negocio.

- Después de un reset exitoso, mostrar un modal local con los datos de acceso y un botón para copiar un texto listo para WhatsApp.
  Alternativa considerada: abrir WhatsApp directamente. Se descarta para no asumir dispositivo, número de destino ni flujo externo.

## Risks / Trade-offs

- Contraseña débil elegida por el administrador interno -> Validar que el campo no esté vacío y reutilizar el mínimo existente del sistema si no hay una política definida.
- Sesiones activas existentes siguen funcionando hasta expirar -> Documentado como non-goal por el modelo actual de JWT stateless.
- Exposición accidental de contraseña en UI -> Mantenerla solo mientras el modal está abierto y limpiarla al cerrarlo.
