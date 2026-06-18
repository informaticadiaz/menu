## Context

`better-sqlite3` es síncrono y soporta transacciones nativas (`db.transaction(fn)`), lo cual es ideal para esta operación: crear una fila en `restaurants` y otra en `admin_users` deben ocurrir juntas o no ocurrir. La propuesta `admin-panel` introduce el hashing de password (bcryptjs) y la emisión de JWT (jsonwebtoken); este cambio reutiliza esa infraestructura en vez de duplicarla, por lo que depende de que se implemente primero (o en el mismo ciclo).

`restaurants.slug` ya tiene constraint `UNIQUE` en el schema; `admin_users.email` también es `UNIQUE`. La validación de unicidad puede apoyarse en esos constraints como última línea de defensa, pero la UX requiere detectarlo antes de intentar el insert para dar un mensaje claro.

## Goals / Non-Goals

**Goals:**
- Permitir que un restaurante nuevo se registre sin intervención manual, quedando con sesión activa al finalizar.
- Garantizar que nunca exista un restaurante sin admin asociado, ni un admin sin restaurante.
- Generar slugs válidos y únicos automáticamente cuando el usuario no provee uno, o cuando el provisto colisiona.

**Non-Goals:**
- No incluye verificación de email (confirmación por correo) — el signup es inmediato, sin paso de verificación, igual que el resto del MVP.
- No incluye planes de pago, períodos de prueba ni ningún concepto de billing.
- No incluye múltiples admins por restaurante (se mantiene el constraint actual `admin_users.restaurant_id UNIQUE`).
- No incluye recuperación de slug/email olvidado.

## Decisions

**Transacción atómica con `db.transaction()` de better-sqlite3.** Envolver el insert de `restaurants` y `admin_users` en una única transacción síncrona garantiza que ambos se creen juntos o ninguno, sin necesidad de lógica de rollback manual. Si el insert de `admin_users` falla (por ejemplo, constraint de email duplicado detectado tarde), la transacción revierte el insert de `restaurants` automáticamente.

**Slugify + sufijo numérico para colisiones, en vez de rechazar y pedir reintento.** Se normaliza el nombre del restaurante a slug (minúsculas, espacios a guiones, sin caracteres especiales) y, si ya existe, se prueba `slug-2`, `slug-3`, etc. hasta encontrar uno libre. Esto reduce friction en el alta — el usuario puede editar el slug sugerido en el formulario si no le gusta, pero no se bloquea por una colisión que no anticipaba.

**Validación de unicidad de slug/email vía consulta previa, no solo capturando el error de constraint.** Aunque el constraint `UNIQUE` de SQLite es la garantía final contra race conditions, se hace una consulta `SELECT` previa para devolver un mensaje de error específico y amigable (slug vs. email) en el caso común, en vez de parsear el mensaje de error de SQLite.

**Reutilización directa de las funciones de hashing/JWT de `admin-panel`**, sin duplicar lógica. Este es el motivo de la dependencia de secuencia documentada en el proposal.

## Risks / Trade-offs

- [Race condition: dos signups simultáneos con el mismo slug podrían pasar la validación previa antes de que ninguno haya insertado] → Mitigación: el constraint `UNIQUE` de la base de datos sigue siendo la garantía final; si ocurre, el segundo insert falla dentro de la transacción y se devuelve un error genérico de reintento (caso extremadamente raro en este volumen de uso).
- [Signup sin verificación de email permite registrar restaurantes con emails inválidos o ajenos] → Aceptado como Non-Goal explícito por ahora; se documenta como mejora futura si el producto escala.
- [Slug autogenerado podría no ser el deseado por el dueño] → Mitigación: el campo slug es editable en el formulario antes de enviar, con validación en tiempo real de formato.

## Migration Plan

1. Implementar (o confirmar implementado) `admin-panel`: hashing de password, emisión de JWT, middleware de auth.
2. Implementar `POST /api/auth/signup` con la transacción de alta.
3. Decidir si se elimina `POST /api/restaurants` o se deja sin documentar para uso interno/seed — recomendado: eliminarlo, ya que el seed puede insertar directamente en la base sin pasar por la API.
4. Implementar `/signup` en el frontend.
5. Sin migración de datos: el restaurante semilla ya existe y no se ve afectado.

## Open Questions

- Ninguna pendiente para este alcance.
