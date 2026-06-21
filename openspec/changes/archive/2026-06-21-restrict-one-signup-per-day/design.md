## Context

El signup se implementa en `fuego/backend/src/index.ts` como `POST /api/auth/signup`. Hoy valida email, slug y luego crea `restaurants` y `admin_users` dentro de una transacción, usando `restaurants.created_at` con un ISO timestamp generado por el backend.

La restricción buscada es global: la aplicación debe aceptar como máximo una cuenta nueva por día, independientemente de email, slug o IP. El formulario público en `fuego/frontend/app/signup/page.tsx` ya muestra errores generales cuando el backend devuelve un mensaje que no corresponde a slug ni email.

## Goals / Non-Goals

**Goals:**

- Bloquear signups adicionales cuando ya exista un restaurante creado durante el día actual.
- Hacer la validación antes de crear restaurante, admin o sesión.
- Mantener el flujo actual para el primer signup del día.
- Evitar cambios de modelo si la información existente permite aplicar la regla.

**Non-Goals:**

- No implementar rate limiting por IP, CAPTCHA, verificación de email ni pagos.
- No agregar un panel administrativo para configurar el límite.
- No cambiar el mecanismo de sesión httpOnly existente.

## Decisions

- Usar `restaurants.created_at` como fuente de verdad del límite diario. Alternativa considerada: crear una tabla específica de intentos de signup. Se descarta porque el requisito limita cuentas creadas, no intentos, y `restaurants.created_at` ya registra esa creación.
- Definir el día como día UTC del servidor. Alternativa considerada: usar una zona horaria de negocio configurable. Se descarta para este cambio porque no existe configuración de zona horaria y el backend ya guarda timestamps ISO.
- Ejecutar la verificación antes de calcular hash de password y antes de la transacción de creación. Esto evita trabajo innecesario y garantiza que el rechazo no cree datos parciales ni cookie de sesión.
- Responder con estado `429` cuando se excede el límite diario. Alternativa considerada: `409`. Se elige `429` porque el rechazo representa una limitación temporal de uso del endpoint.
- Mostrar el mensaje como error general del formulario. No hace falta agregar un campo específico porque la restricción no corresponde a un input individual.

## Risks / Trade-offs

- [Dos signups simultáneos podrían pasar la consulta previa antes de insertar] → Mitigación: repetir la verificación dentro de la transacción inmediatamente antes del insert, usando el mismo rango UTC diario.
- [UTC puede no coincidir con la expectativa local del negocio] → Mitigación: documentar la decisión en el spec; si más adelante se necesita zona horaria local, crear un delta específico.
- [La regla global puede bloquear altas legítimas durante demos o pruebas] → Mitigación: mantener el alcance explícito y cubrirlo con tests para que el comportamiento sea deliberado.
