## Cambio

Después del check manual, el restablecimiento de contraseña necesita mostrar un modal con los datos listos para enviar al negocio por WhatsApp.

## Requisito agregado

- Tras restablecer la contraseña, la UI debe mostrar URL de login, email del admin y nueva contraseña.
- El modal debe permitir copiar esos datos en un mensaje listo para compartir.
- La contraseña puede mantenerse en estado solo mientras el modal está abierto y debe limpiarse al cerrarlo.

## Impacto

- Solo UI en `fuego/frontend/app/system/system-panel.tsx`.
- No cambia el endpoint ni el modelo de datos.
